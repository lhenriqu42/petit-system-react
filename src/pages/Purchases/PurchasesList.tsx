import {
	Fab,
	Paper,
	TableRow,
	TableCell,
	TextField,
	Skeleton,
	Box,
	Typography,
	ButtonGroup,
	Button,
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { format } from 'date-fns';
import { LayoutMain } from "../../shared/layouts";
import { nToBRL } from "../../shared/services/formatters";
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { Link } from "react-router-dom";
import { IProduct, ISupplier, ProductService, PurchaseService, SupplierService } from "../../shared/services/api";
import { ListItems } from "../../shared/components/ListItems";
import { ModalButton } from "../../shared/components/ModalButton";
import { useEffect, useState } from "react";
import { CustomAutoComplete } from "../../shared/forms/customInputs/CustomAutoComplete";
import { CustomTextField } from "../../shared/forms/customInputs/CustomTextField";

export const PurchasesList: React.FC = () => {
	const [prodSearch, setProdSearch] = useState("");
	const [prodSelected, setProdSelected] = useState<IProduct>();

	const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
	const [supplierSelected, setSupplierSelected] = useState<{ id: number; label: string }>({ id: -1, label: '' });

	useEffect(() => {
		const fetchSuppliers = async () => {
			try {
				if (suppliers.length === 0) {
					const result = await SupplierService.getAll(undefined, undefined, 99999);
					if (result instanceof Error) {
						alert('Erro ao buscar Fornecedores');
					} else {
						setSuppliers(result.data);
					}
				}
			} catch (e) {
				alert(e);
			}
		};
		fetchSuppliers();
	}, []);


	return (
		<>
			<LayoutMain title="Pedidos" subTitle={"Gerencie os pedidos de produtos"}>
				<Paper sx={{ backgroundColor: '#fff', mr: 4, px: 3, py: 1 }} variant="elevation">
					<Box display={'flex'} justifyContent={'space-between'}>
						<ModalButton
							modalProps={{
								title: "Novo Pedido",
								submit: () => { },
								submitButtonProps: { Text: "Salvar" },
								ModalContent:
									<Box>
										<Box border={1} borderColor={'#ccc'} borderRadius={2} p={1} display={'flex'} mb={1} justifyContent={'center'} gap={2}>
											<Box width={"34%"}>
												<CustomAutoComplete
													callback={setSupplierSelected}
													size="small"
													label="Fornecedor"
													options={suppliers.map(sup => ({ id: sup.id, label: sup.name }))}
													minWidth={250}
												/>
											</Box>
											<Box display="flex" alignItems="center" justifyContent={"center"} width={"66%"}>
												{(() => {
													const sup = suppliers.find(sup => sup.id === supplierSelected?.id);

													return (
														<Box display={'flex'} alignItems={'center'} justifyContent={'space-around'} width={'100%'}>
															<Box display={'flex'} alignItems={'center'}>
																<Typography>Fornecedor:</Typography>
																<Typography ml={1} fontWeight={'bold'} color={sup ? 'success' : 'error'}>{sup ? sup.name : 'Nenhum'}</Typography>
															</Box>
															<Box display={'flex'} alignItems={'center'}>
																<Typography ml={2}>Produto:</Typography>
																<Typography ml={1} fontWeight={'bold'} color={prodSelected ? 'success' : 'error'}>{prodSelected ? prodSelected.name : 'Nenhum'}</Typography>
															</Box>
														</Box>
													);
												})()}
											</Box>
										</Box>
										<Box display={'flex'} gap={2} height={650}>
											<Box width={'34%'} height={'100%'} border={1} borderColor={'#ccc'} borderRadius={2} p={2} display={'flex'} flexDirection={'column'}>
												<Typography mb={1}>Produtos</Typography>
												<TextField size="small" placeholder="Pesquisar" fullWidth value={prodSearch} onChange={(e) => setProdSearch(e.target.value)} />
												<ListItems
													height={'100%'}
													itemsPerPage={10}
													filters={prodSearch}
													apiCall={ProductService.getAll}
													CustomTableRow={({ row }) => (
														<TableRow hover sx={{ cursor: 'pointer' }} onClick={() => setProdSelected(row)} selected={prodSelected && row.id === prodSelected.id}>
															<TableCell>{row.name}</TableCell>
														</TableRow>
													)}
												/>
											</Box>
											<Box width={'66%'} height={'100%'} border={1} borderColor={'#ccc'} borderRadius={2} p={2} display={'flex'} flexDirection={'column'} gap={3}>
												<Typography mb={1}>Demais Informações:</Typography>
												<CustomTextField
													type="number"
													unsigned
													sx={{ width: 200 }}
													label="Quantidade"
													size="small"
												/>
												<ButtonGroup variant="contained" aria-label="outlined button group" sx={{ width: 200 }}>
													<Button sx={{ width: '50%' }} variant="contained">Unico</Button>
													<Button sx={{ width: '50%' }} variant="outlined">Total</Button>
												</ButtonGroup>
												<Box display={'flex'} gap={2}>
													<CustomTextField
														cash
														unsigned
														sx={{ width: 200 }}
														label="Preço Unitário"
														size="small"
													/>
													<CustomTextField
														cash
														unsigned
														sx={{ width: 200 }}
														label="Preço Total"
														size="small"
													/>
												</Box>
											</Box>
										</Box>
									</Box>
							}}
						>
							<AddIcon sx={{ mr: 1 }} /> Nova Compra
						</ModalButton>
					</Box>
				</Paper>
				<Paper variant="elevation" sx={{ backgroundColor: '#fff', mr: 4, px: 3, py: 1, mt: 1, width: 'auto', pb: 2 }} >
					<ListItems
						height={670}
						apiCall={PurchaseService.getAll}
						CustomTableRowHeader={() => (
							<TableRow>
								<TableCell width={200}>Data</TableCell>
								<TableCell>Fornecedor</TableCell>
								<TableCell>Valor Total</TableCell>
								<TableCell>Ações</TableCell>
							</TableRow>
						)}
						CustomTableRow={({ row }) => (
							<TableRow>
								<TableCell>{format(new Date(row.created_at), 'dd/MM/yyyy - HH:mm')}</TableCell>
								<TableCell>{row.supplier_name}</TableCell>
								<TableCell>{nToBRL(row.total_value)}</TableCell>
								<TableCell>
									<Link to={`/compras/${row.id}`}>
										<Fab
											size="medium"
											sx={{
												backgroundColor: '#5bc0de',
												'&:hover': { backgroundColor: '#6fd8ef' },
											}}
										>
											<VisibilityRoundedIcon color="info" />
										</Fab>
									</Link>
								</TableCell>
							</TableRow>
						)}
						CustomTableSkeleton={() => (
							<TableRow>
								<TableCell><Skeleton sx={{ minHeight: 40, maxWidth: 50 }} /></TableCell>
								<TableCell><Skeleton sx={{ minHeight: 40, maxWidth: 80 }} /></TableCell>
								<TableCell><Skeleton sx={{ minHeight: 40, maxWidth: 80 }} /></TableCell>
								<TableCell><Skeleton sx={{ minHeight: 40, maxWidth: 80 }} /></TableCell>
								<TableCell><Fab disabled size='medium'></Fab></TableCell>
							</TableRow>
						)}
					/>
				</Paper>
			</LayoutMain >
		</>
	);
};
