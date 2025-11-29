import { Api } from './axios-config';

const Autorization = () => {
	return {
		headers: {
			Authorization: `Bearer ${localStorage.getItem('APP_ACCESS_TOKEN')}`
		}
	}
}

export interface IRequestCreateBody {
	supplier_id: number,
	prod_id: number,
	pack_id?: number,
	supplier_prod_id: string,

	supplier_prod_code: string,
	supplier_prod_name: string,
}

export interface ISupplierProdMap {
	id: number,
	supplier_prod_code: string,
	supplier_prod_name: string,

	supplier_prod_id: string,
	supplier_id: number,

	prod_id: number,
	pack_id: number | null,

	created_at: Date,
	updated_at: Date,

}

export interface INFEmitterCreateBody {
	cnpj: string,
	x_nome: string,
	x_fant: string,
	ie?: string,
	cep?: string,
	uf?: string,
	city?: string,
	district?: string,
	street?: string,
	number?: string,
	complemento?: string,
	// address_str: string,  // Adicionado automaticamente via trigger no banco de dados
}

export interface INFEmitter {
	cnpj: string,
	x_nome: string,
	x_fant: string,
	supplier_id?: number,
	ie?: string,
	cep?: string,
	uf?: string,
	city?: string,
	district?: string,
	street?: string,
	number?: string,
	complemento?: string,
	address_str?: string,
}

export interface IGetMapResponse extends ISupplierProdMap {
	prod_name: string;
	pack_qtt: number | null;
}

const getProdMap = async (supplierId: number, supplierProdId: string,): Promise<IGetMapResponse | null> => {
	try {
		const { status, data } = await Api.get(`/supplier-prod-map/${supplierId}/${supplierProdId}`, Autorization());
		if (status === 204) return null;
		return data;
	} catch (error) {
		console.error(error);
		throw new Error((error as { message: string }).message || 'Erro ao buscar o mapeamento.');
	}
}
const createOrUpdate = async (body: IRequestCreateBody): Promise<IGetMapResponse> => {
	try {
		const { data } = await Api.post(`/supplier-prod-map`, body, Autorization());
		return data;
	} catch (error) {
		console.error(error);
		throw new Error((error as { message: string }).message || 'Erro ao atualizar o registro.');
	}
};

export type INFEmitterResponse = INFEmitter & { id: number };
const createNFEmitter = async (NFEmitter: INFEmitterCreateBody): Promise<INFEmitterResponse> => {
	try {
		const { data } = await Api.post(`/nfemitter`, NFEmitter, Autorization());
		return data;
	} catch (error) {
		console.error(error);
		throw new Error((error as { message: string }).message || 'Erro ao criar o emissor de NF.');
	}
};

const linkNFEmitterToSupplier = async (nfEmitterId: number, supplierId: number): Promise<void> => {
	try {
		await Api.put(`/nfemitter/${nfEmitterId}/linkSupplier`, { supplier_id: supplierId }, Autorization());
	} catch (error) {
		console.error(error);
		throw new Error((error as { message: string }).message || 'Erro ao vincular o emissor de NF ao fornecedor.');
	}
};

const getNFEmitterByCNPJ = async (cnpj: string): Promise<INFEmitterResponse | null> => {
	try {
		const { status, data } = await Api.get(`/nfemitter/${cnpj}`, Autorization());
		if (status === 204) return null;
		return data;
	} catch (error) {
		console.error(error);
		throw new Error((error as { message: string }).message || 'Erro ao buscar o emissor de NF pelo CNPJ.');
	}
}
export const SupProdMapService = {
	createNFEmitter,
	linkNFEmitterToSupplier,
	createOrUpdate,
	getNFEmitterByCNPJ,
	getProdMap,
};