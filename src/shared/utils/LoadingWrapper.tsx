import Swal from "sweetalert2";

type Fn = (...args: any[]) => any;
type AsyncFn = (...args: any[]) => Promise<any>;
type Task = (() => any) | (() => Promise<any>) | Promise<any>;

export class LoadingWrapper {
	private Task: () => Promise<any>;
	private SuccessCallback: AsyncFn = async () => { };
	private ErrorCallback: AsyncFn = async () => { };
	private SuccessMessage?: string;
	private ErrorMessage?: string;

	constructor(task: Task) {
		this.Task = async () => {
			return typeof task === "function" ? await task() : await task;
		};
	}

	onSuccess(callback: Fn | null, message?: string) {
		this.SuccessCallback = async (...args) => callback?.(...args);
		this.SuccessMessage = message;
		return this;
	}

	onError(callback: Fn | null, message?: string) {
		this.ErrorCallback = async (...args) => callback?.(...args);
		this.ErrorMessage = message;
		return this;
	}

	async fire(loadingMessage = "Carregando...", options = { awaitCallbacks: false }) {

		// 🔹 1. Abre modal de loading
		Swal.fire({
			title: loadingMessage,
			allowOutsideClick: false,
			didOpen: () => Swal.showLoading(),
		});

		try {
			// 🔹 2. Executa tarefa principal
			const result = await this.Task();
			if (result instanceof Error) throw result;
			// 🔹 3. Fecha modal de loading
			Swal.close();

			// 🔹 4. Exibe mensagem de sucesso (opcional)
			if (this.SuccessMessage) {
				await Swal.fire(this.SuccessMessage, "", "success");
			}

			// 🔹 5. Executa callback de sucesso
			if (options.awaitCallbacks) await this.SuccessCallback(result);
			else this.SuccessCallback(result);

			return result;

		} catch (error) {

			// 🔹 Mesmo se der erro no Swal.close, continua
			try { Swal.close(); } catch { }

			// 🔹 6. Exibe mensagem de erro (opcional)
			if (this.ErrorMessage) {
				await Swal.fire(this.ErrorMessage, "", "error");
			}

			// 🔹 7. Executa callback de erro
			if (options.awaitCallbacks) await this.ErrorCallback(error);
			else this.ErrorCallback(error);

			throw error;
		}
	}
}
