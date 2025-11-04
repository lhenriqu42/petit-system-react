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
import AddTaskIcon from '@mui/icons-material/AddTask';
import AddIcon from '@mui/icons-material/Add';
import { format, set } from 'date-fns';
import { LayoutMain } from "../../shared/layouts";
import { nToBRL } from "../../shared/services/formatters";
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { Link } from "react-router-dom";
import { IProduct, ISupplier, PackService, ProductService, PurchaseService, SupplierService } from "../../shared/services/api";
import { ListItems } from "../../shared/components/ListItems";
import { ModalButton } from "../../shared/components/ModalButton";
import { useEffect, useState } from "react";
import { CustomAutoComplete } from "../../shared/forms/customInputs/CustomAutoComplete";
import { CustomTextField } from "../../shared/forms/customInputs/CustomTextField";
import { CustomButtonGroup } from "../../shared/forms/customInputs/CustomButtonGroup";
import AssignmentIcon from '@mui/icons-material/Assignment';
// import DataObjectIcon from '@mui/icons-material/DataObject';
import CodeIcon from '@mui/icons-material/Code';
import { ListArray } from "../../shared/components/ListArray";
import { CustomSelect } from "../../shared/forms/customInputs/CustomSelect";

export const PurchasesList: React.FC = () => {





	return (
		<>
			<LayoutMain title="Pedidos" subTitle={"Gerencie os pedidos de produtos"}>
				<Paper sx={{ backgroundColor: '#fff', mr: 4, px: 3, py: 1 }} variant="elevation">
					<Box display={'flex'} justifyContent={'space-between'}>
						<ModalButton
							modalProps={{
								p: 0,
								title: "Novo Pedido",
								maxWidth: 'xl',
								submit: async () => { },
								submitButtonProps: { Text: "Salvar" },
								ModalContent:
									<CreateModalContent />,
							}}
						>
							<AddIcon sx={{ mr: 1 }} /> Nova Compra
						</ModalButton>
						<Box display="flex" alignItems="center" gap={1}>
							<Button
								variant="contained"
								color="warning"
								startIcon={<CodeIcon />}
								sx={{
									backgroundColor: '#1d74f0',
									'&:hover': { backgroundColor: '#0d64e0' },
								}}
							>
								Importar XML
							</Button>
							<Button
								variant="contained"
								startIcon={<AssignmentIcon />}
							>
								Relatórios
							</Button>
						</Box>
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
								<TableCell>Detalhes</TableCell>
								<TableCell align="right">Efetivar Estoque</TableCell>
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
								<TableCell align="right">
									<Fab
										size="medium"
										color="success"
									// sx={{
									// 	backgroundColor: '#5bc0de',
									// 	'&:hover': { backgroundColor: '#6fd8ef' },
									// }}
									>
										<AddTaskIcon color="info" />
									</Fab>
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














interface ISelectedItem {
	prod_id: number;
	prod_name: string;
	mode: 'PACK' | 'PRODUCT';
	pack_id?: number;			// only if mode is PACK
	quantity: number;
	price: number;

}

const CreateModalContent: React.FC = () => {
	const [prodSearch, setProdSearch] = useState("");







	// SELECTED ITEMS
	const [selected, setSelected] = useState<ISelectedItem[]>([]);
	const toggleSelect = (item: ISelectedItem) => {
		setSelected((prev) => {
			const next = [...prev];
			const index = next.findIndex((i) => i.prod_id === item.prod_id);
			if (index !== -1) {
				next.splice(index, 1);
			} else {
				next.push(item);
			}
			return next;
		});
	};





	// PACKS BY PROD
	// const [packs, setPacks] = useState<Map<number, { text: string, value: string }[]>>(new Map());
	// useEffect(() => {
	// 	packs.forEach((_, key) => {
	// 		if (!selected.has(key)) {
	// 			setPacks((prev) => {
	// 				const next = new Map(prev);
	// 				next.delete(key);
	// 				return next;
	// 			});
	// 		}
	// 	});
	// 	selected.forEach((value, key) => {
	// 		if (!packs.has(key)) {
	// 			PackService.getPacksByProd(1, 9999999, { prod_id: key }).then(result => {
	// 				if (result instanceof Error) {
	// 					alert('Erro ao buscar embalagens para o produto ' + value.name);
	// 				} else {
	// 					if (result.data.length == 0) {
	// 						return setPacks((prev) => new Map(prev).set(key, [{ text: 'Nenhuma embalagem encontrada', value: '0' }]));
	// 					}
	// 					setPacks((prev) => new Map(prev).set(key, result.data.map(pack => ({ text: pack.description, value: `${pack.id}` }))));
	// 				}
	// 			});
	// 		}
	// 	});
	// }, [selected]);







	// SUPPLIERS
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
							</Box>
						);
					})()}
				</Box>
			</Box>
			<Box border={2} p={1} borderColor={'#ccc'} borderRadius={2} gap={1} display={'flex'} flexDirection={'column'} height={740} >
				<Box display={'flex'} gap={2}>
					<Box width={'35%'} border={1} borderColor={'#ccc'} borderRadius={2} px={2} py={1} display={'flex'} flexDirection={'column'}>
						<Typography mb={1}>Produtos</Typography>
						<CustomTextField label={'Pesquisar'} size="small" value={prodSearch} onChange={(e) => setProdSearch(e.target.value)} sx={{ mb: 1 }} />
						<ListItems
							height={625}
							itemsPerPage={11}
							filters={prodSearch}
							apiCall={ProductService.getAll}
							CustomTableRow={({ row }) => (
								<TableRow hover sx={{ cursor: 'pointer' }} onClick={() => toggleSelect({ prod_id: row.id, prod_name: row.name, mode: 'PACK', quantity: 1, price: 0 })} selected={selected.some(item => item.prod_id === row.id)}>
									<TableCell>{row.name}</TableCell>
								</TableRow>
							)}
						/>
					</Box>
					<Box display="flex" flexDirection="column" gap={1} border={2} borderColor={'#555'} p={2} borderRadius={2} width={'100%'}>
						<Typography variant="subtitle1">Itens Selecionados:</Typography>
						<Box border={1} borderColor={'#77f'} borderRadius={2} height={'100%'} pb={2} sx={{ backgroundColor: '#fafafe' }}>
							<ListArray
								itemsPerPage={8}
								customPlaceHolder="Nenhum item selecionado"
								height={650}
								items={selected}
								CustomTableRow={({ row }) => {
									return (
										<TableRow hover sx={{ cursor: 'default' }}>
											<TableCell>
												{row.prod_name.split(/(\d+)/).map((part, i) =>
															/\d+/.test(part) ? (
																<Typography component="span" key={i} color="secondary" fontWeight={700}>
																	{part}
																</Typography>
															) : (
																<span key={i}>{part}</span>
															)
														)}
												{/* {row.prod_name} */}
											</TableCell>
											<TableCell>
												<CustomButtonGroup
													onChange={(btn) => {
														setSelected((prev) => {
															const next = [...prev];
															const index = next.findIndex(i => i.prod_id === row.prod_id);
															if (index !== -1) {
																next[index].mode = btn?.label === 'Embalagem' ? 'PACK' : 'PRODUCT';
															}
															return next;
														});
													}}
													size="small"
													buttons={[{ label: 'Embalagem' }, { label: 'Unitario' }]}
												/>
											</TableCell>
											<TableCell>
												<Box display="flex" alignItems="self-start" gap={1}>
													{
														row.mode === 'PACK' &&
														<CustomSelect
															required
															defaultSelected={0}
															minWidth={150}
															borderColor={{ normal: '#1976d2', hover: '#115293', focused: '#0d3c71' }}
															size="small"
															menuItens={[{ text: 'Selecionar Embalagem', value: '0' }]}
														/>
													}
												</Box>
											</TableCell>
											<TableCell>
												<CustomTextField
													unsigned
													size="small"
													type="number"
												/>
											</TableCell>
											<TableCell>
												<CustomTextField
													unsigned
													size="small"
													type="number"
												/>
											</TableCell>
										</TableRow>
									)
								}}
							/>
						</Box>
					</Box>
				</Box>
			</Box >
		</Box >
	);
};