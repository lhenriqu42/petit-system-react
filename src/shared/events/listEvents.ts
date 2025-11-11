import { EventEmitter } from "../utils/EventEmitter";

export const listReloadEvent = new EventEmitter<[string, { page: number | 'current' }?]>();