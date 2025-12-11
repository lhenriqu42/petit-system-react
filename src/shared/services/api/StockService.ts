import { IProduct } from '.';
import { Api } from './axios-config';

const Autorization = () => {
	return {
		headers: {
			Authorization: `Bearer ${localStorage.getItem('APP_ACCESS_TOKEN')}`
		}
	}
}

export interface IProductWithStock extends IProduct {
	stock: number;
	prod_id: number;
}


const update = async (prod_id: number, stock: number, desc?: string): Promise<number> => {
	try {
		return await Api.put('/stock/update/' + prod_id, { quantity: stock, desc }, Autorization());
	} catch (error) {
		console.error(error);
		throw new Error((error as { message: string }).message || 'Erro ao editar o registro.');
	}
};

const updateTo = async (prod_id: number, toStock: number, desc?: string): Promise<number> => {
	try {
		return await Api.put('/stock/updateTo/' + prod_id, { quantity: toStock, desc }, Autorization());
	} catch (error) {
		console.error(error);
		throw new Error((error as { message: string }).message || 'Erro ao editar o registro.');
	}
};

export const StockService = {
	update,
	updateTo,
};