import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {
    AddTaskArgType, ResultCode,
    TaskPriorities,
    TaskStatuses,
    TaskType,
    todolistsAPI,
    UpdateTaskModelType
} from 'common/api/todolists-api'
import {appActions} from "app/app-reducer";
import {AppThunk} from 'app/store'
import {clearTasksAndTodo} from "common/actions/common.actions";
import {todolistsActions} from "features/TodolistsList/todolists-reducer";
import {Dispatch} from "redux";
import {createAppSyncThunk} from "common/utils";
import {handleServerAppError} from "common/utils";
import {handleServerNetworkError} from "common/utils";

const initialState: TasksStateType = {}
type AsyncThunkConfig = {
    state?: unknown
    dispatch?: Dispatch
    extra?: unknown
    rejectValue?: unknown
    serializedErrorType?: unknown
    pendingMeta?: unknown
    fulfilledMeta?: unknown
    rejectedMeta?: unknown
}
const fetchTasks = createAppSyncThunk<{ tasks: TaskType[], todolistId: string }, string>
("tasks/fetchTasks", async (todolistId, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI
    try {
        dispatch(appActions.setAppStatus({status: 'loading'}))
        const res = await todolistsAPI.getTasks(todolistId)

        const tasks = res.data.items
        dispatch(appActions.setAppStatus({status: 'succeeded'}))
        return {tasks, todolistId}
    } catch (e) {
        handleServerNetworkError(e, dispatch);
        return rejectWithValue(null)
    }

})
const addTask = createAppSyncThunk<{ task: TaskType }, AddTaskArgType>("tasks/addTasks",
    async (arg, thunkAPI) => {
        const {dispatch, rejectWithValue} = thunkAPI
        try {
            dispatch(appActions.setAppStatus({status: 'loading'}))
            const res = await todolistsAPI.createTask(arg)
            if (res.data.resultCode === 0) {
                const task = res.data.data.item
                dispatch(appActions.setAppStatus({status: 'succeeded'}))
                return {task}
            } else {
                handleServerAppError(res.data, dispatch);
                return rejectWithValue(null)
            }
        } catch (e) {
            handleServerNetworkError(e, dispatch)
            return rejectWithValue(null)
        }
    })

type UpdateTaskArgType = {
    taskId: string
    domainModel: UpdateDomainTaskModelType
    todolistId: string
}

const updateTask =
    createAppSyncThunk<UpdateTaskArgType, UpdateTaskArgType>
    ("tasks/updateTasks", async (arg, thunkAPI) => {
        const {dispatch, getState, rejectWithValue} = thunkAPI
        try {
            dispatch(appActions.setAppStatus({status: 'loading'}))
            const state = getState()
            const task = state.tasks[arg.todolistId].find(t => t.id === arg.taskId)
            if (!task) {
                dispatch(appActions.setAppError({error: 'task not found in the state'}))
                return rejectWithValue(null)
            }

            const apiModel: UpdateTaskModelType = {
                deadline: task.deadline,
                description: task.description,
                priority: task.priority,
                startDate: task.startDate,
                title: task.title,
                status: task.status,
                ...arg.domainModel
            }
            const res = await todolistsAPI.updateTask(arg.todolistId, arg.taskId, apiModel)

            if (res.data.resultCode === ResultCode.Success) {
                dispatch(appActions.setAppStatus({status: 'succeeded'}))
                return arg
            } else {
                handleServerAppError(res.data, dispatch);
                return rejectWithValue(null)
            }
        } catch (e) {
            handleServerNetworkError(e, dispatch);
            return rejectWithValue(null)
        }
    })


export const slice = createSlice({
    name: "tasks",
    initialState,
    reducers: {
        removeTask: (state, action: PayloadAction<{ taskId: string, todolistId: string }>) => {
            const tasks = state[action.payload.todolistId]
            const index = tasks.findIndex(todo => todo.id === action.payload.taskId)
            if (index !== -1) tasks.splice(index, 1)
        },
    },
    extraReducers: builder => {
        builder
            .addCase(fetchTasks.fulfilled, (state, action) => {
                state[action.payload.todolistId] = action.payload.tasks
            })
            .addCase(addTask.fulfilled, (state, action) => {
                state[action.payload.task.todoListId].unshift(action.payload.task)
            })
            .addCase(updateTask.fulfilled, (state, action) => {
                const tasks = state[action.payload.todolistId]
                const index = tasks.findIndex(todo => todo.id === action.payload.taskId)
                if (index !== -1) {
                    tasks[index] = {...tasks[index], ...action.payload.domainModel}
                }
            })
            .addCase(todolistsActions.addTodolist, (state, action) => {
                state[action.payload.todolist.id] = []
            })
            .addCase(todolistsActions.removeTodolist, (state, action) => {
                delete state[action.payload.id]
            })
            .addCase(todolistsActions.setTodolists, (state, action) => {
                action.payload.todolists.forEach(tl => {
                    state[tl.id] = []
                })
            })
            .addCase(clearTasksAndTodo, (state, action) => {
                return action.payload.tasks
            })
    }
})
export const tasksReducer = slice.reducer
export const tasksActions = slice.actions
export const tasksThunks = {fetchTasks, addTask, updateTask}

// thunks

export const removeTaskTC = (taskId: string, todolistId: string): AppThunk => (dispatch) => {
    todolistsAPI.deleteTask(todolistId, taskId)
        .then(res => {
            const action = tasksActions.removeTask({taskId, todolistId})
            dispatch(action)
        })
}


// types
export type UpdateDomainTaskModelType = {
    title?: string
    description?: string
    status?: TaskStatuses
    priority?: TaskPriorities
    startDate?: string
    deadline?: string
}
export type TasksStateType = {
    [key: string]: Array<TaskType>
}
