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
import AddIcon from '@mui/icons-material/Add';
import CodeIcon from '@mui/icons-material/Code';
import BlockIcon from '@mui/icons-material/Block';
import { LayoutMain } from "../../shared/layouts";
import AddTaskIcon from '@mui/icons-material/AddTask';
import { nToBRL } from "../../shared/services/formatters";
import { CreateModalContent } from "./Modals/ModalCreate";
import { PurchaseService } from "../../shared/services/api";
import AssignmentIcon from '@mui/icons-material/Assignment';
import { ListItems } from "../../shared/components/ListItems";
import { submitFormEvent } from "../../shared/events/formEvents";
import { ModalButton } from "../../shared/components/ModalButton";
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { ModalFab } from "../../shared/components/ModalFab";
import { EditModalContent } from "./Modals/ModalEdit";
import { listReloadEvent } from "../../shared/events/listEvents";
import Swal from "sweetalert2";
import { ViewModalContent } from "./Modals/ModalView";
import { modalCloseEvent } from "../../shared/events/modalEvents";
import { ModalXMLImport } from "./Modals/XML/ModalXMLImport";
import { useNavigate } from "react-router-dom";
import { LoadingWrapper } from "../../shared/utils/LoadingWrapper";


export const PurchasesList: React.FC = () => {
	const navigate = useNavigate();
	const completePurchase = (isEditing: boolean, purchaseId: number, supplier_name: string) => {
		if (isEditing) {
			Swal.fire({
				title: 'Atenção',
				text: 'Existem alterações não salvas neste pedido. Por favor, salve ou descarte as alterações antes de concluir o pedido.',
			});
			return;
		}
		Swal.fire({
			title: 'Concluir Pedido',
			html: `Fornecedor: <b>${supplier_name.toUpperCase()}</b><br><br>Tem certeza que deseja concluir o pedido? Isso vai acrescentar os produtos ao estoque. Esta ação não pode ser desfeita.`,
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
		}).then((result) => {
			if (result.isConfirmed) {
				const promise = PurchaseService.completePurchase(purchaseId)
				new LoadingWrapper(promise)
					.onSuccess(() => listReloadEvent.emit('purchase_list', { page: 'current' }))
					.onError(() => {
						Swal.fire(
							'Erro',
							'Ocorreu um erro ao concluir o pedido. Por favor, tente novamente.',
							'error'
						);
					})
					.fire('Concluindo pedido...')
			}
		});
	}

	const cancelPurchase = async (purchaseId: number, supplier_name: string) => {
		const result = await Swal.fire({
			title: 'Cancelar Pedido',
			html: `Fornecedor: <b>${supplier_name.toUpperCase()}</b><br><br>Tem certeza que deseja cancelar o pedido?`,
			showCancelButton: true,
			confirmButtonColor: '#d33',
		});

		if (result.isConfirmed) {
			new LoadingWrapper(PurchaseService.cancelPurchase(purchaseId))
				.onSuccess(() => {
					localStorage.removeItem(`purchase_edit_selected_${purchaseId}`);
					localStorage.removeItem(`purchase_edit_sup_${purchaseId}`);
					listReloadEvent.emit('purchase_list', { page: 'current' });
				})
				.onError(() => {
					Swal.fire(
						'Erro',
						'Ocorreu um erro ao cancelar o pedido. Por favor, tente novamente.',
						'error'
					);
				}).fire('Cancelando pedido...');
		}
	}

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
								maxWidth: '90%',
								submit: async () => { submitFormEvent.emit({ formId: 'purchase_create' }) },
								submitButtonProps: { Text: "Salvar" },
								ModalContent:
									<CreateModalContent />,
							}}
						>
							<AddIcon sx={{ mr: 1 }} /> Nova Compra
						</ModalButton>
						<Box display="flex" alignItems="center" gap={1}>
							<ModalButton
								variant="contained"
								color="warning"
								startIcon={<CodeIcon />}
								sx={{
									backgroundColor: '#1d74f0',
									'&:hover': { backgroundColor: '#0d64e0' },
								}}
								modalProps={{
									title: 'Importar XML de Nota Fiscal',
									id: 'purchase_import_xml_modal',
									maxWidth: '75%',
									submit: async () => { submitFormEvent.emit({ formId: 'submitPurchaseByXML' }) },
									ModalContent: <ModalXMLImport modalId="purchase_import_xml_modal" />,
								}}
							>
								Importar XML
							</ModalButton>
							<Button
								disabled
								color="warning"
								variant="contained"
								startIcon={<AssignmentIcon />}
								onClick={() => { navigate('/relatorios') }}
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
											<ModalFab
												size="medium"
												backgroundColor={{ default: '#5bc0de', hover: '#6fd8ef' }}
												modalProps={{
													submit: async () => { modalCloseEvent.emit({ modalId: 'purchase_view_modal' }) },
													id: 'purchase_view_modal',
													p: 0,
													maxWidth: '70%',
													submitButtonProps: { Text: "Voltar" },
													cancelButton: false,
													title: `Visualizar Pedido #${row.id}`,
													ModalContent: (
														<ViewModalContent purchaseId={row.id} />
													)
												}}
											>
												<VisibilityRoundedIcon color="info" />
											</ModalFab>
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
																	maxWidth: '90%',
																	submit: async () => { submitFormEvent.emit({ formId: 'purchase_edit' }) },
																	submitButtonProps: { Text: "Salvar" },
																	cancelButton: false,
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
																onClick={() => completePurchase(isEditing, row.id, row.supplier_name)}
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
																onClick={() => { cancelPurchase(row.id, row.supplier_name) }}
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