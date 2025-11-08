type Listener<TArgs extends any[]> = (...args: TArgs) => void;

export class EventEmitter<TArgs extends any[] = []> {
	private listeners = new Set<Listener<TArgs>>();

	on(listener: Listener<TArgs>) {
		this.listeners.add(listener);
		return () => { this.listeners.delete(listener) };
	}

	emit(...args: TArgs) {
		for (const listener of this.listeners) {
			listener(...args);
		}
	}
}
