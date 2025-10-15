export const nToBRL = (value: number | undefined | null) => {
	if (!value) return 'R$ 0,00';
	return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export const BRLToN = (string: string) => {
	const getNumbers = string.replace(/[^\d,.-]/g, '');
	return Number(getNumbers.replace('.', '').replace(',', '.'));
}

export const queryBuilder = (query: { [key: string]: any }) => {
	const queryString = Object.keys(query);
	if (queryString.length === 0) return '';
	return '?' + queryString.map(key => `${key}=${encodeURIComponent(query[key])}`).join('&');
}

export const urlBuilder = (baseUrl: string, query: { [key: string]: any }) => {
	const queryString = queryBuilder(query);
	return baseUrl + queryString;
}