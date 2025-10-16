import {
	Fab,
	Paper,
	TableRow,
	TableCell,
	TextField,
	Skeleton,
	Box,
	Typography,
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { format } from 'date-fns';
import { LayoutMain } from "../../shared/layouts";
import { nToBRL } from "../../shared/services/formatters";
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { Link } from "react-router-dom";
import { ProductService, PurchaseService } from "../../shared/services/api";
import { ListItems } from "../../shared/components/ListItems";
import { ModalButton } from "../../shared/components/ModalButton";
import { useState } from "react";
import { CustomAutoComplete } from "../../shared/forms/customInputs/CustomAutoComplete";

export const PurchasesList: React.FC = () => {
	const [prodSearch, setProdSearch] = useState("");
	const suppliers = [
		{ id: 1, label: "Fornecedor A" },
		{ id: 2, label: "Fornecedor B" },
		{ id: 3, label: "Fornecedor C" },
	];
	const [selectedSupplier, setSelectedSupplier] = useState(false);
	return (
		<>
			<LayoutMain title="Compras" subTitle={"Gerencie as compras de produtos"}>
				<Paper sx={{ backgroundColor: '#fff', mr: 4, px: 3, py: 1 }} variant="elevation">
					<Box display={'flex'} justifyContent={'space-between'}>
						<ModalButton
							modalProps={{
								title: "Nova Compra",
								submit: () => { },
								submitButtonProps: { Text: "Salvar" },
								ModalContent:
									<Box>
										<Box border={1} borderColor={'#ccc'} borderRadius={2} p={1} display={'flex'} flexDirection={'row'} gap={5} mb={1} alignItems={'space-between'}>
											<CustomAutoComplete
												required
												size="small"
												label="Fornecedor"
												options={suppliers}
												minWidth={200}
											/>
										</Box>
										<Box display={'flex'} flexDirection={'row'} gap={2} height={650}>
											<Box width={'34%'} height={'100%'} border={1} borderColor={'#ccc'} borderRadius={2} p={2} display={'flex'} flexDirection={'column'}>
												<Typography mb={1}>Produtos</Typography>
												<TextField size="small" placeholder="Pesquisar" fullWidth value={prodSearch} onChange={(e) => setProdSearch(e.target.value)} />
												<Box>
													<ListItems
														itemsPerPage={10}
														filters={prodSearch}
														apiCall={ProductService.getAll}
														height={520}
														CustomTableRow={({ row }) => (
															<TableRow>
																<TableCell>{row.name}</TableCell>
															</TableRow>
														)}
													/>
												</Box>
											</Box>
											<Box width={'66%'} height={'100%'} border={1} borderColor={'#ccc'} borderRadius={2} p={2} display={'flex'} flexDirection={'column'} >

											</Box>
										</Box>
									</Box>
							}}
						>
							<AddIcon sx={{ mr: 1 }} /> Nova Compra
						</ModalButton>
					</Box>
				</Paper>
				<Paper variant="elevation" sx={{ backgroundColor: '#fff', mr: 4, px: 3, py: 1, mt: 1, width: 'auto' }}>
					<ListItems
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
