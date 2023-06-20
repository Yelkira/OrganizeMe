import {appActions} from 'app/app.reducer';
import {CommonResponseType} from 'common/types/common.types';
import {Dispatch} from 'redux';

export const handleServerAppError = <D>(data: CommonResponseType<D>, dispatch: Dispatch, showError: boolean = true) => {
    if (showError) {
        dispatch(appActions.setAppError(data.messages.length ? {error: data.messages[0]} : {error: 'Some error occurred'}))
    }
    dispatch(appActions.setAppStatus({status: 'failed'}))
}
