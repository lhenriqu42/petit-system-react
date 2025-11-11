import { EventEmitter } from "../utils/EventEmitter";

export const modalCloseEvent = new EventEmitter<[{modalId: string}]>();