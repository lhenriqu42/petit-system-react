// import { Environment } from '../../environment';
// import { urlBuilder } from '../formatters';
// import { Api } from './axios-config';

// const Autorization = () => {
// 	return {
// 		headers: {
// 			Authorization: `Bearer ${localStorage.getItem('APP_ACCESS_TOKEN')}`
// 		}
// 	}
// }

// type TCurvaABCInfo = {
// 	group: 'A' | 'B' | 'C';
// 	percentage: number;
// 	acumulatedPercentage: number;
// };

// export interface IProdUtilsDTO {
// 	prod_id: number;
// 	number_of_sales: number;            // Número de Vendas = contagem das vendas realizadas
// 	revenue: number;                    // Faturamento = soma(valor_total_das_vendas)
// 	CPV: number;                        // CPV = Estoque Inicial + Compras – Estoque Final
// 	profit: number;                     // Lucro Bruto = Faturamento - CPV
// 	MB: number;                         // Margem Bruta (MB) = Lucro Bruto / Faturamento
// 	liquidProfit: number;               // Lucro Líquido = Lucro Bruto - Despesas Operacionais
// 	ML: number;                         // Margem Líquida (ML) = Lucro Líquido / Faturamento
// 	ticketAverage: number;              // Ticket Médio = Faturamento / Número de Vendas
// 	GE: number;                         // Giro de Estoque (GE) = CPV / Estoque Médio
// 	diasDeEstoque: number;              // Cobertura de Estoque (DE) = Estoque Atual / ((CPV / Número de dias do período))
// 	idadeMediaEstoque: number;          // Idade Média do Estoque = 365 / GE
// 	CurvaABC: TCurvaABCInfo;
// }

// export interface IReportDataDTO {
// 	revenue: number;
// 	profit: number;
// 	liquidProfit: number;
// 	MB: number;
// 	ML: number;
// 	ticketAverage: number;
// 	details: IProdUtilsDTO[];
// }

// const generateGeneralReport = async (range: { start: Date, end: Date }): Promise<IReportDataDTO> => {
// 	try {
// 		// const urlRelativa = urlBuilder('/report', range);
// 		// const { data } = await Api.get(urlRelativa, Autorization());
// 		// if (data) {
// 		// 	return data;
// 		// }
// 		// throw new Error('Erro ao gerar o relatório.');

// 		// Mocked data for demonstration purposes
// 		return {
// 			revenue: 100000,
// 			profit: 40000,
// 			liquidProfit: 30000,
// 			MB: 0.4,
// 			ML: 0.3,
// 			ticketAverage: 500,
// 			details: [
// 				{
// 					prod_id: 1,
// 					number_of_sales: 50,
// 					revenue: 20000,
// 					CPV: 8000,
// 					profit: 12000,
// 					MB: 0.6,
// 					liquidProfit: 9000,
// 					ML: 0.45,
// 					ticketAverage: 400,
// 					GE: 5,
// 					diasDeEstoque: 73,
// 					idadeMediaEstoque: 73,
// 					CurvaABC: {
// 						group: 'A',
// 						percentage: 20,
// 						acumulatedPercentage: 20,
// 					},
// 				},
// 				{
// 					prod_id: 2,
// 					number_of_sales: 30,
// 					revenue: 15000,
// 					CPV: 7000,
// 					profit: 8000,
// 					MB: 0.53,
// 					liquidProfit: 6000,
// 					ML: 0.4,
// 					ticketAverage: 500,
// 					GE: 4,
// 					diasDeEstoque: 91,
// 					idadeMediaEstoque: 91,
// 					CurvaABC: {
// 						group: 'B',
// 						percentage: 15,
// 						acumulatedPercentage: 35,
// 					},
// 				},
// 				{
// 					prod_id: 3,
// 					number_of_sales: 40,
// 					revenue: 15000,
// 					CPV: 7000,
// 					profit: 8000,
// 					MB: 0.53,
// 					liquidProfit: 6000,
// 					ML: 0.4,
// 					ticketAverage: 500,
// 					GE: 4,
// 					diasDeEstoque: 91,
// 					idadeMediaEstoque: 91,
// 					CurvaABC: {
// 						group: 'B',
// 						percentage: 15,
// 						acumulatedPercentage: 35,
// 					},
// 				},
// 			],
// 		};
// 	} catch (error) {
// 		console.error(error);
// 		throw new Error((error as { message: string }).message || 'Erro ao gerar o relatório.');
// 	}
// };

// export const ReportService = {
// 	generateGeneralReport,
// };