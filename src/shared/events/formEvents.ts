import { EventEmitter } from "../utils/EventEmitter";

export const submitFormEvent = new EventEmitter<[{formId: string}]>();