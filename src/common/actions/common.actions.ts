import {createAction} from "@reduxjs/toolkit";
import {TasksStateType} from "features/TodolistsList/tasks-reducer";
import {TodolistDomainType} from "features/TodolistsList/todolists-reducer";

type ClearTasksAndTodoType={
    tasks:TasksStateType
    todolists: TodolistDomainType[]
}

export const clearTasksAndTodo = createAction<ClearTasksAndTodoType>("common/clear-tasks-todolists")