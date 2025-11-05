import {
	Box,
	Fab,
	Paper,
	Button,
	Skeleton,
	TableRow,
	TableCell,
} from "@mui/material";
import { format } from 'date-fns';
import { Link } from "react-router-dom";
import AddIcon from '@mui/icons-material/Add';
import CodeIcon from '@mui/icons-material/Code';
import { LayoutMain } from "../../shared/layouts";
import AddTaskIcon from '@mui/icons-material/AddTask';
import { nToBRL } from "../../shared/services/formatters";
import { CreateModalContent } from "./Create/ModalCreate";
import { PurchaseService } from "../../shared/services/api";
import AssignmentIcon from '@mui/icons-material/Assignment';
import { ListItems } from "../../shared/components/ListItems";
import { ModalButton } from "../../shared/components/ModalButton";
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';


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