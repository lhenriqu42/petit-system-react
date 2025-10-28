type Listener<T> = (payload: T) => void;

export class EventEmitter<T = void> {
	private listeners = new Set<Listener<T>>();

	on(listener: Listener<T>) {
		this.listeners.add(listener);
		return () => {this.listeners.delete(listener)};
	}

	emit(payload: T extends void ? undefined : T) {
		for (const listener of this.listeners) {
			listener(payload as T);
		}
	}
}
