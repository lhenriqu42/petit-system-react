type Listener<TArgs extends any[]> = (...args: TArgs) => any;

export class EventEmitter<TArgs extends any[] = []> {
	private listeners = new Set<Listener<TArgs>>();

	on(listener: Listener<TArgs>) {
		this.listeners.add(listener);
		return () => { this.listeners.delete(listener) };
	}

	emit(...args: TArgs) {
		const responses = [];
		for (const listener of this.listeners) {
			responses.push(listener(...args));
		}
		return responses;
	}
}
