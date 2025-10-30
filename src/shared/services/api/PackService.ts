import { Environment } from '../../environment';
import { urlBuilder } from '../formatters';
import { Api } from './axios-config';
import { IProduct } from './ProductService';

const Autorization = () => {
	return {
		headers: {
			Authorization: `Bearer ${localStorage.getItem('APP_ACCESS_TOKEN')}`
		}
	}
}

export interface ICreateBody {
	prod_qnt: number;
}

export interface IGetAllResponse {
	data: {
		id: number;
		description: string;
		prod_qnt: number;
		created_at: Date;
		updated_at: Date;
		products_count: number;
	}[]
	totalCount: number;
}

export interface IGetPacksByProdResponse {
	data: {
		id: number;
		description: string;
		prod_qnt: number;
		created_at: Date;
		updated_at: Date;
	}[]
	totalCount: number;
}

const create = async (body: ICreateBody): Promise<number | Error> => {
	try {
		const { data } = await Api.post('/pack', body, Autorization());

		if (data) {
			return data.id;
		}

		return new Error('Erro ao criar o registro.');
	} catch (error) {
		console.error(error);
		return new Error((error as { message: string }).message || 'Erro ao criar o registro.');
	}
};

const getAll = async (page = 1, limit = Environment.LIMITE_DE_LINHAS, filter?: { id?: number }): Promise<IGetAllResponse | Error> => {
	try {
		const excludeProdId = filter?.id ? { excludeProdId: filter.id } : {};
		const urlRelativa = urlBuilder('/pack', { page, limit, ...excludeProdId });
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

const getAllProducts = async (page = 1, limit = Environment.LIMITE_DE_LINHAS, filter?: { id?: number, prodName?: string }): Promise<{ data: IProduct[]; totalCount: number } | Error> => {
	try {
		const excludeParam = filter?.id ? { excludePackId: filter.id } : {};
		const prodNameParam = filter?.prodName ? { prodName: filter.prodName } : {};
		const urlRelativa = urlBuilder('/pack/products', { page, limit, ...excludeParam, ...prodNameParam });
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

const getPacksByProd = async (page = 1, limit = Environment.LIMITE_DE_LINHAS, filter?: { prod_id: number }): Promise<IGetAllResponse | Error> => {
	if (!filter || !filter.prod_id) {
		return new Error('Parâmetro "prod_id" é obrigatório.');
	}
	try {
		const urlRelativa = urlBuilder(`/pack/${filter.prod_id}`, { page, limit });
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

const getProdsByPack = async (page = 1, limit = Environment.LIMITE_DE_LINHAS, filter?: { pack_id: number, prodName?: string }): Promise<{ data: IProduct[]; totalCount: number } | Error> => {
	if (!filter || !filter.pack_id) {
		return new Error('Parâmetro "pack_id" é obrigatório.');
	}
	const prodNameParam = filter.prodName ? { prodName: filter.prodName } : {};
	try {
		const urlRelativa = urlBuilder(`/pack/getProds/${filter.pack_id}`, { page, limit, ...prodNameParam });
		const { data, headers } = await Api.get(urlRelativa, Autorization());
		if (data) {
			return {
				data: data,
				totalCount: Number(headers['x-total-count'] || Environment.LIMITE_DE_LINHAS),
			};
		}

		return new Error('Erro ao listar os produtos do embalagem.');
	} catch (error) {
		console.error(error);
		return new Error((error as { message: string }).message || 'Erro ao listar os produtos do embalagem.');
	}
};

const putProdsInPack = async ({ pack_id, prods }: { pack_id: number, prods: number[] }): Promise<void | Error> => {
	try {
		await Api.post(`/pack/putProds/${pack_id}`, { prods }, Autorization());
	} catch (error) {
		console.error(error);
		return new Error((error as { message: string }).message || 'Erro ao atualizar os produtos na embalagem.');
	}
};

const putPacksInProd = async ({ prod_id, packs }: { prod_id: number, packs: number[] }): Promise<void | Error> => {
	try {
		await Api.post(`/pack/putPacks/${prod_id}`, { packs }, Autorization());
	} catch (error) {
		console.error(error);
		return new Error((error as { message: string }).message || 'Erro ao atualizar as embalagens no produto.');
	}
};

const removeProdsFromPack = async ({ pack_id, prods }: { pack_id: number, prods: number[] }): Promise<void | Error> => {
	try {
		await Api.delete(`/pack/removeProds/${pack_id}`, { data: { prods }, ...Autorization() });
	} catch (error) {
		console.error(error);
		return new Error((error as { message: string }).message || 'Erro ao remover os produtos da embalagem.');
	}
}

const removePacksFromProd = async ({ prod_id, packs }: { prod_id: number, packs: number[] }): Promise<void | Error> => {
	try {
		await Api.delete(`/pack/removePacks/${prod_id}`, { data: { packs }, ...Autorization() });
	} catch (error) {
		console.error(error);
		return new Error((error as { message: string }).message || 'Erro ao remover as embalagens do produto.');
	}
}

export const PackService = {
	create,
	getAll,
	getProdsByPack,
	getPacksByProd,
	putProdsInPack,
	putPacksInProd,
	removeProdsFromPack,
	removePacksFromProd,
	getAllProducts,
};