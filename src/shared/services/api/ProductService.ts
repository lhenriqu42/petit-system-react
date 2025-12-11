import { Environment } from '../../environment';
import { Api } from './axios-config';

const Autorization = () => {
	return {
		headers: {
			Authorization: `Bearer ${localStorage.getItem('APP_ACCESS_TOKEN')}`
		}
	}
}

export interface IProduct {
	id: number,
	code: string,
	name: string,
	sector: number,
	price: number,
	quantity?: number;
	created_at: Date,
	updated_at: Date,
	deleted_at?: Date,
	stock?: number,
	last_price_purchased?: number,
	last_unit_cost?: number,
	avg_cost?: number,

}

type TProductTotalCount = {
	data: IProduct[];
	totalCount: number;
}

export interface IProdOutput {
	id: number,

	prod_id: number,
	quantity: number,
	reason: string,

	desc?: string,
	fincash_id?: number,

	created_at: Date,
	updated_at: Date,
	deleted_at?: Date
}

export interface IOutputQuery {
	output_id: number,
	fincash_id?: number,
	quantity: number,
	reason: string,
	desc?: string,
	created_at: Date,
	updated_at: Date,

	prod_id: number,
	prod_code: string,
	prod_name: string,
	prod_sector: number,
	prod_price: number
}

interface IProdOutputResponse {
	data: IOutputQuery[],
	totalCount: number,
}

const getAll = async (page = 1, limit = Environment.LIMITE_DE_LINHAS, filter = { search: '', orderByStock: false }): Promise<TProductTotalCount | Error> => {
	try {
		const urlRelativa = `/product?page=${page}&limit=${limit}&filter=${filter.search}&orderByStock=${filter.orderByStock}`;
		const { data, headers } = await Api.get(urlRelativa, Autorization());
		if (data) {
			return {
				data,
				totalCount: Number(headers['x-total-count'] || Environment.LIMITE_DE_LINHAS),
			};
		}

		return new Error('Erro ao listar os registros.');
	} catch (error) {
		console.error(error);
		return new Error((error as { message: string }).message || 'Erro ao listar os registros.');
	}
};


const create = async (dados: Omit<IProduct, 'id' | 'created_at' | 'updated_at'>): Promise<number | Error> => {
	try {
		const { data } = await Api.post<IProduct>('/product', dados, Autorization());

		if (data) {
			return data.id;
		}

		return new Error('Erro ao criar o registro.');
	} catch (error) {
		console.error(error);
		return new Error((error as { message: string }).message || 'Erro ao criar o registro.');
	}
};

const updateById = async (id: number, dados: Omit<IProduct, 'id' | 'created_at' | 'updated_at' | 'code'>): Promise<void | Error> => {
	try {
		await Api.put(`/product/${id}`, dados, Autorization());
	} catch (error) {
		console.error(error);
		return new Error((error as { message: string }).message || 'Erro ao atualizar o registro.');
	}
};

const deleteById = async (id: number): Promise<void | Error> => {
	try {
		await Api.delete(`/product/${id}`, Autorization());
	} catch (error) {
		console.error(error);
		return new Error((error as { message: string }).message || 'Erro ao apagar o registro.');
	}
};

const getById = async (id: number): Promise<IProduct | Error> => {
	try {
		const { data } = await Api.get(`/product/${id}`, Autorization());

		if (data) {
			return data;
		}

		return new Error('Erro ao consultar o registro.');
	} catch (error) {
		console.error(error);
		return new Error((error as { message: string }).message || 'Erro ao consultar o registro.');
	}
};

const getOutputById = async (id: number): Promise<IOutputQuery | Error> => {
	try {
		const { data } = await Api.get(`/product-output/${id}`, Autorization());

		if (data) {
			return data;
		}

		return new Error('Erro ao consultar o registro.');
	} catch (error) {
		console.error(error);
		return new Error((error as { message: string }).message || 'Erro ao consultar o registro.');
	}
};

const getByCode = async (code: string): Promise<IProduct | Error> => {
	try {
		const { data } = await Api.get(`/product/code/${code}`, Autorization());

		if (data) {
			return data;
		}

		return new Error('Erro ao consultar o registro.');
	} catch (error) {
		console.error(error);
		return new Error((error as { message: string }).message || 'Erro ao consultar o registro.');
	}
};

const getQuantityBySector = async (): Promise<{ sector: number, quantity: number }[] | Error> => {
	try {
		const { data } = await Api.get('/product/per-sector', Autorization());
		if (data) {
			return data;
		}

		return new Error('Erro ao consultar o registro.');
	} catch (e) {
		console.log(e)
		return new Error((e as { message: string }).message || 'Erro ao consultar o registro.');
	}
}

const getValueBySector = async (start: Date, end: Date): Promise<{ sector: number, value: number }[] | Error> => {
	try {
		const { data } = await Api.get(`/product/per-value?start=${start.toISOString()}&end=${end.toISOString()}`, Autorization());
		if (data) {
			return data;
		}

		return new Error('Erro ao consultar o registro.');
	} catch (e) {
		console.log(e)
		return new Error((e as { message: string }).message || 'Erro ao consultar o registro.');
	}
}

const getStockValueBySector = async (): Promise<{ sector: number, value: number }[] | Error> => {
	try {
		const { data } = await Api.get('/product/per-stock-value', Autorization());
		if (data) {
			return data;
		}

		return new Error('Erro ao consultar o registro.');
	} catch (e) {
		console.log(e)
		return new Error((e as { message: string }).message || 'Erro ao consultar o registro.');
	}
}

const getStockBySector = async (): Promise<{ sector: number, stock: number }[] | Error> => {
	try {
		const { data } = await Api.get('/product/per-stock', Autorization());
		if (data) {
			return data;
		}

		return new Error('Erro ao consultar o registro.');
	} catch (e) {
		console.log(e)
		return new Error((e as { message: string }).message || 'Erro ao consultar o registro.');
	}
}

const prodOutput = async (prod_output: Omit<IProdOutput, 'id' | 'created_at' | 'updated_at'>) => {
	try {
		const { data } = await Api.post('/product/output', prod_output, Autorization());

		if (data) {
			return data.outputId;
		}

		return new Error('Erro ao criar o registro.');
	} catch (error) {
		console.error(error);
		return new Error((error as { message: string }).message || 'Erro ao criar o registro.');
	}
}

const getAllOutputs = async (page = 1, limit = 7): Promise<IProdOutputResponse | Error> => {
	try {
		const urlRelativa = `/product-output/getall?page=${page}&limit=${limit}`;
		const { data, headers } = await Api.get(urlRelativa, Autorization());
		if (data) {
			return {
				data,
				totalCount: Number(headers['x-total-count'] || Environment.LIMITE_DE_LINHAS),
			};
		}

		return new Error('Erro ao listar os registros.');
	} catch (error) {
		console.error(error);
		return new Error((error as { message: string }).message || 'Erro ao listar os registros.');
	}
}

export const ProductService = {
	getAll,
	create,
	getById,
	getByCode,
	prodOutput,
	deleteById,
	updateById,
	getAllOutputs,
	getOutputById,
	getValueBySector,
	getStockBySector,
	getQuantityBySector,
	getStockValueBySector,
};