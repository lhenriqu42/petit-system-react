import {
	Box,
	TableRow,
	TableCell,
	Typography,
	CircularProgress,
} from "@mui/material";
import { nToBRL } from "../../../shared/services/formatters";
import { ListArray } from "../../../shared/components/ListArray";
import { useEffect, useState } from "react";
import { IPurchaseDetails, PurchaseService } from "../../../shared/services/api/PurchaseService";


export const ViewModalContent: React.FC<{ purchaseId: number }> = ({ purchaseId }) => {
	const PROFIT_TARGET_MARGIN = 50;
	const [data, setData] = useState<IPurchaseDetails>();

	useEffect(() => {
		const fetchData = async () => {
			try {
				const data = await PurchaseService.getDetails(purchaseId);
				setData(data);
			} catch (error) {
				console.error(error);
			}
		};

		fetchData();
	}, []);

	return (
		<Box>
			<Box border={1} borderColor={'#ccc'} borderRadius={2} p={1} display={'flex'} mb={1} justifyContent={'center'} gap={2}>
				{data === undefined
					?
					<Typography>Carregando...</Typography>
					:
					<>
						<Box display="flex" alignItems="center" justifyContent={"center"} width={"100%"}>

							<Box display={'flex'} alignItems={'center'} justifyContent={'space-around'} width={'100%'}>
								<Box display={'flex'} alignItems={'center'}>
									<Typography>Fornecedor:</Typography>
									<Typography ml={1} fontWeight={'bold'} color={data.supplier.name ? 'success' : 'error'}>{data.supplier.name || 'Nenhum'}</Typography>
								</Box>
								<Box display={'flex'} alignItems={'center'}>
									<Typography>Valor Total:</Typography>
									<Typography ml={1} fontWeight={'bold'} color={data.total_value > 0 ? 'success' : 'textPrimary'}>{nToBRL(data.total_value)}</Typography>
								</Box>
								<Box display={'flex'} alignItems={'center'}>
									<Typography>Status:</Typography>
									<Typography ml={1} fontWeight={'bold'} color={data.effected ? 'success' : 'error'}>{data.effected ? 'Concluído' : 'Pendente'}</Typography>
								</Box>
							</Box>
						</Box>
					</>
				}
			</Box>
			<Box border={2} p={1} borderColor={'#ccc'} borderRadius={2} gap={1} display={'flex'} flexDirection={'column'} height={740} pb={1.5}>
				<Box display={'flex'} gap={2}>
					{data === undefined
						?
						<Box flex={1} display="flex" justifyContent="center" alignItems="center" height={740}>
							<CircularProgress size={200} />
						</Box>
						:
						<>
							<Box display="flex" flexDirection="column" gap={0.5} border={2} borderColor={'#555'} px={2} py={0} borderRadius={2} width={'100%'}>
								<Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} mt={0.5} pr={3}>
									<Typography variant="subtitle1" mt={0.5}>Itens do Pedido:</Typography>

								</Box>
								<Box border={1} borderColor={'#77f'} borderRadius={2} height={'100%'} pb={1} mb={1.5} sx={{ backgroundColor: '#fafafe' }}>
									{(() => {
										const ProdPartColor = {
											header: { text: '#000', bg: '#f7f746ff', lines: '#e0d50099' },
											row: { text: '#000', bg: '#faface', lines: '#e0d50099' }
										};

										const purchasePartColor = {
											header: { text: '#FFFFFF', bg: '#004C99', lines: '#003366' },
											row: { text: '#000', bg: '#D0E4FB', lines: '#A0C4FF' }
										};
										return (
											<ListArray
												id='purchase-items-list'
												itemsPerPage={10}
												customPlaceHolder="Nenhum item encontrado"
												height={680}
												items={data.items_summary.items}
												CustomTableRowHeader={() => (
													<TableRow>
														<TableCell
															sx={{
																borderRadius: '7px 0 0 0',
																backgroundColor: ProdPartColor.header.bg,
																color: ProdPartColor.header.text,
																borderBottomColor: ProdPartColor.header.lines
															}}>
															Produto
														</TableCell>

														<TableCell
															sx={{
																backgroundColor: ProdPartColor.header.bg,
																color: ProdPartColor.header.text,
																borderBottomColor: ProdPartColor.header.lines
															}}>
															Preço Venda
														</TableCell>

														<TableCell
															sx={{
																backgroundColor: purchasePartColor.header.bg,
																color: purchasePartColor.header.text,
																borderBottomColor: purchasePartColor.header.lines
															}}>
															Quantidade
														</TableCell>
														<TableCell
															sx={{
																backgroundColor: purchasePartColor.header.bg,
																color: purchasePartColor.header.text,
																borderBottomColor: purchasePartColor.header.lines
															}}>Custo Unitário </TableCell>

														<TableCell
															sx={{
																backgroundColor: purchasePartColor.header.bg,
																color: purchasePartColor.header.text,
																borderBottomColor: purchasePartColor.header.lines
															}}>Preço Total</TableCell>
														<TableCell
															sx={{
																borderRadius: '0 7px 0 0',
																backgroundColor: purchasePartColor.header.bg,
																color: purchasePartColor.header.text,
																borderBottomColor: purchasePartColor.header.lines
															}}>Porcentagem Lucro</TableCell>

													</TableRow>
												)}
												CustomTableRow={({ row }) => {
													const realQnt = row.pack_quantity ? (row.quantity * row.pack_quantity) : row.quantity;
													const unitCost = (row.pricetotal / realQnt);
													const profitPercentage = ((row.prod_price - unitCost) / row.prod_price) * 100;
													return (
														<TableRow key={row.id}>
															<TableCell
																sx={{
																	borderRadius: '7px 0 0 0',
																	backgroundColor: ProdPartColor.row.bg,
																	color: ProdPartColor.row.text,
																	borderBottomColor: ProdPartColor.row.lines
																}}>
																{row.prod_name}
															</TableCell>

															<TableCell
																sx={{
																	borderRadius: '7px 0 0 0',
																	backgroundColor: ProdPartColor.row.bg,
																	color: ProdPartColor.row.text,
																	borderBottomColor: ProdPartColor.row.lines
																}}>{nToBRL(row.prod_price)}
															</TableCell>

															<TableCell
																sx={{
																	backgroundColor: purchasePartColor.row.bg,
																	color: purchasePartColor.row.text,
																	borderBottomColor: purchasePartColor.row.lines
																}}>{realQnt}</TableCell>
															<TableCell
																sx={{
																	backgroundColor: purchasePartColor.row.bg,
																	color: purchasePartColor.row.text,
																	borderBottomColor: purchasePartColor.row.lines
																}}>{nToBRL(unitCost)}</TableCell>

															<TableCell
																sx={{
																	backgroundColor: purchasePartColor.row.bg,
																	color: purchasePartColor.row.text,
																	borderBottomColor: purchasePartColor.row.lines
																}}>{nToBRL(row.pricetotal)}</TableCell>
															<TableCell
																sx={{
																	backgroundColor: purchasePartColor.row.bg,
																	color: purchasePartColor.row.text,
																	borderBottomColor: purchasePartColor.row.lines
																}}><Typography color={profitPercentage > PROFIT_TARGET_MARGIN ? 'success' : 'error'}>{profitPercentage.toFixed(2)}%</Typography></TableCell>
														</TableRow>
													)
												}}
											/>
										)
									})()}
								</Box>
							</Box>
						</>
					}
				</Box>
			</Box >
		</Box >
	);
};