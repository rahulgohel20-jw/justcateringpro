
import {  message } from 'antd';

export const underConstruction = () => {
    message.warning('This module is under construction. Please check back later.');
}

export const successMsgPopup = (msg= "successfully created") => {
    message.success(msg);
}

export const errorMsgPopup = (msg= "successfully created") => {
    message.error(msg);
}