import {
	Box,
	Fab,
	Paper,
	Button,
	Skeleton,
	TableRow,
	TableCell,
	Typography,
	Icon,
} from "@mui/material";
import { format } from 'date-fns';
import { Link } from "react-router-dom";
import AddIcon from '@mui/icons-material/Add';
import CodeIcon from '@mui/icons-material/Code';
import BlockIcon from '@mui/icons-material/Block';
import { LayoutMain } from "../../shared/layouts";
import AddTaskIcon from '@mui/icons-material/AddTask';
import { nToBRL } from "../../shared/services/formatters";
import { CreateModalContent } from "./Create/ModalCreate";
import { PurchaseService } from "../../shared/services/api";
import AssignmentIcon from '@mui/icons-material/Assignment';
import { ListItems } from "../../shared/components/ListItems";
import { submitFormEvent } from "../../shared/events/formEvents";
import { ModalButton } from "../../shared/components/ModalButton";
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { ModalFab } from "../../shared/components/ModalFab";
import { EditModalContent } from "./Create/ModalEdit";
import { listReloadEvent } from "../../shared/events/listEvents";


export const PurchasesList: React.FC = () => {


	return (
		<>
			<LayoutMain title="Pedidos" subTitle={"Gerencie os pedidos de produtos"}>
				<Paper sx={{ backgroundColor: '#fff', mr: 4, px: 3, py: 1 }} variant="elevation">
					<Box display={'flex'} justifyContent={'space-between'}>
						<ModalButton
							modalProps={{
								id: 'purchase_create_modal',
								p: 0,
								title: "Novo Pedido",
								maxWidth: 'xl',
								submit: async () => { submitFormEvent.emit({ formId: 'purchase_create' }) },
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
						id="purchase_list"
						height={670}
						apiCall={PurchaseService.getAll}
						CustomTableRowHeader={() => (
							<TableRow>
								<TableCell width={200}>Data</TableCell>
								<TableCell>Fornecedor</TableCell>
								<TableCell>Valor Total</TableCell>
								<TableCell>Detalhes</TableCell>
								<TableCell align="right">Ações</TableCell>
							</TableRow>
						)}
						CustomTableRow={
							({ row }) => {

								const someCache = localStorage.getItem(`purchase_edit_selected_${row.id}`) || localStorage.getItem(`purchase_edit_sup_${row.id}`);
								const isEditing: boolean = !!someCache;
								return (
									<TableRow
										key={row.id}
										sx={
											row.effected ?
												{ backgroundColor: '#d4edda', '&:hover': { backgroundColor: '#c3e6cb' } }
												:
												isEditing ?
													{ backgroundColor: '#fff3cd', '&:hover': { backgroundColor: '#ffe8a1' } }
													:
													{ '&:hover': { backgroundColor: '#1111' } }
										}
									>
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
											<Box display="flex" gap={1} justifyContent="flex-end">
												<Box key={'edit'}>
													{
														!row.effected && (
															<ModalFab
																onClose={() => { listReloadEvent.emit('purchase_list', { page: 'current' }) }}
																size="medium"
																color="warning"
																modalProps={{
																	id: 'purchase_edit_modal',
																	p: 0,
																	maxWidth: 'xl',
																	submit: async () => { submitFormEvent.emit({ formId: 'purchase_edit' }) },
																	submitButtonProps: { Text: "Salvar" },
																	title: `Editar Pedido #${row.id}`,
																	ModalContent: (
																		<EditModalContent purchaseId={row.id} />
																	)
																}}
															>
																<Icon>edit</Icon>
															</ModalFab>
														)
													}
												</Box>
												<Box key={'effect'}>

													{
														!row.effected ? (
															<Fab
																size="medium"
																color="success"
															>
																<AddTaskIcon color="info" />
															</Fab>
														) : <Typography variant="body2" color="green">Concluído</Typography>
													}
												</Box>
												<Box key={'cancel'}>

													{
														!row.effected && (
															<Fab
																size="medium"
																color="error"
															>
																<BlockIcon />
															</Fab>
														)
													}
												</Box>
											</Box>
										</TableCell>
									</TableRow>
								)
							}
						}
						CustomTableSkeleton={() => (
							<TableRow>
								<TableCell width={200}><Skeleton sx={{ minHeight: 40, maxWidth: 50 }} /></TableCell>
								<TableCell><Skeleton sx={{ minHeight: 40, maxWidth: 80 }} /></TableCell>
								<TableCell><Skeleton sx={{ minHeight: 40, maxWidth: 80 }} /></TableCell>
								<TableCell><Skeleton sx={{ minHeight: 40, maxWidth: 80 }} /></TableCell>
								<TableCell align="right">
									<Fab disabled size='medium' />
									<Fab disabled size='medium' sx={{ mx: 1 }} />
									<Fab disabled size='medium' />
								</TableCell>
							</TableRow>
						)}
					/>
				</Paper>
			</LayoutMain >
		</>
	);
};