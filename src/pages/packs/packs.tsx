import {
	Box,
	Paper,
	Button,
	TableRow,
	TableCell,
	TextField,
	Typography,
} from "@mui/material";
import Swal from "sweetalert2";
import { LayoutMain } from "../../shared/layouts";
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryIcon from '@mui/icons-material/Category';
import InventoryIcon from '@mui/icons-material/Inventory';
import { useEffect, useState } from "react";
import { listReloadEvent } from "../../shared/events/listEvents";
import { ModalButton } from "../../shared/components/ModalButton";
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { ListItems } from "../../shared/components/ListItems";
import { IProduct, ProductService, PackService } from "../../shared/services/api";
import { CustomButtonGroup } from "../../shared/forms/customInputs/CustomButtonGroup";
import { CreatePackModal } from "./CreateModal";
import { useAssignModalProps } from "./RelateModal";




export const Packs: React.FC = () => {

	const [mode, setMode] = useState<"Produtos" | "Embalagens">("Embalagens");

	const [prodSearch, setProdSearch] = useState("");
	const [prodSelected, setProdSelected] = useState<IProduct>();

	const [packSelected, setPackSelected] = useState<{
		id: number;
		description: string;
		prod_qnt: number;
		created_at: Date;
		updated_at: Date;
		products_count: number;
	}>();


	const itemSelected = prodSelected || packSelected;

	useEffect(() => {
		setProdSearch("");
	}, [mode]);




	// REMOVER RELACIONAMENTO
	useEffect(() => {
		setRemoveSelected([]);
	}, [prodSelected, packSelected, mode]);
	const [removeSelected, setRemoveSelected] = useState<number[]>([]);
	const handleRemoveRelationship = async () => {
		if (removeSelected.length === 0) {
			Swal.fire({
				icon: 'warning',
				title: 'Atenção',
				text: 'Nenhum item selecionado.',
			});
			return;
		}
		const result = await Swal.fire({
			title: 'Remover Relacionamento',
			text: `Tem certeza que deseja remover o relacionamento entre os itens selecionados?`,
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Sim, remover',
			cancelButtonText: 'Cancelar',
		});
		if (result.isConfirmed) {
			try {
				let response: Promise<void | Error>;
				if (mode === "Produtos" && prodSelected) {
					response = PackService.removePacksFromProd({ prod_id: prodSelected.id, packs: removeSelected });
				} else if (mode === "Embalagens" && packSelected) {
					response = PackService.removeProdsFromPack({ pack_id: packSelected.id, prods: removeSelected });
				}
				const res = await response!;
				if (res instanceof Error) {
					throw res;
				}
				Swal.fire({
					icon: 'success',
					title: 'Sucesso',
					text: 'Relacionamento removido com sucesso!',
				});
				setRemoveSelected([]);
				listReloadEvent.emit('*');
			} catch (error) {
				alert(error);
			}
		}
	};

	// DELETAR EMBALAGEM
	const handleDelete = async (pack_id: number, description: string) => {
		let timerInterval: number;
		const result = await Swal.fire({
			title: 'Excluir Embalagem',
			html: '<b>Isso irá remover todos os relacionamentos associados.</b><br>Tem certeza que deseja excluir a <br><strong>' + description + '</strong>?',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#d33',
			cancelButtonText: 'Cancelar',
			didOpen: () => {
				const confirmButton = Swal.getConfirmButton();
				if (confirmButton) {
					confirmButton.disabled = true; // Desabilita o botão inicialmente

					let timeLeft = 5;
					confirmButton.textContent = `Prosseguir (${timeLeft})`;

					timerInterval = window.setInterval(() => {
						timeLeft--;
						confirmButton.textContent = `Prosseguir (${timeLeft})`;

						if (timeLeft === 0) {
							clearInterval(timerInterval);
							confirmButton.textContent = 'Prosseguir';
							confirmButton.disabled = false; // Habilita o botão após o timer
						}
					}, 1000);
				}
			},
			willClose: () => {
				clearInterval(timerInterval); // Limpa o intervalo quando o modal fechar
			}
		})
		if (result.isConfirmed) {
			try {
				setPackSelected(undefined);
				await PackService.deleteById(pack_id);
				Swal.fire({
					icon: 'success',
					title: 'Sucesso',
					text: 'Embalagem excluída com sucesso!',
				});
				listReloadEvent.emit('*');
			} catch (error) {
				alert(error);
			}
		}
	};

	const assignProdModalProps = useAssignModalProps(
		{ id: prodSelected ? prodSelected.id : 0, label: prodSelected ? prodSelected.name : '', mode: 'pack' },
		() => {
			listReloadEvent.emit('*');
			setProdSearch("");
		}
	);

	const assignPackModalProps = useAssignModalProps(
		{ id: packSelected ? packSelected.id : 0, label: packSelected ? packSelected.description : '', mode: 'prod' },
		() => { listReloadEvent.emit('*'); }
	);

	return (
		<>
			<LayoutMain title="Embalagens" subTitle={"Cadastro de embalagens de produtos"}>
				<Box display={'flex'}>
					<Box width={'37%'}>
						<Paper variant="elevation" sx={{ backgroundColor: '#fff', mr: 2, px: 3, py: 1, my: 1 }}>
							<Box display={'flex'} gap={2} height={'90%'} py={1} justifyContent={'space-between'}>
								<CustomButtonGroup
									buttons={[{ label: "Embalagens" }, { label: "Produtos" }]}
									onChange={(selected) => {
										setMode(selected?.label as "Produtos" | "Embalagens");
										setProdSelected(undefined);
										setPackSelected(undefined);
									}}
								/>
							</Box>
						</Paper>
						<Paper variant="elevation" sx={{ backgroundColor: '#fff', mr: 2, px: 3, py: 1 }} >
							<Box display={'flex'} gap={2} height={'90%'} py={2}>
								<Box width={'100%'} height={'100%'} border={1} borderColor={'#ccc'} borderRadius={2} p={2} display={'flex'} flexDirection={'column'} minHeight={585}>
									<Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
										<Typography mb={1} pt={1}>{mode}</Typography>
										{
											mode === "Embalagens" &&
											<CreatePackModal />
										}
									</Box>
									{
										mode === "Produtos" ?
											<>
												<TextField size="small" placeholder="Pesquisar" fullWidth value={prodSearch} onChange={(e) => setProdSearch(e.target.value)} margin="normal" />
												<ListItems
													id="prod-list"
													itemsPerPage={8}
													height={470}
													filters={{ search: prodSearch, orderByStock: false }}
													apiCall={ProductService.getAll}
													CustomTableRow={({ row }) => (
														<TableRow hover sx={{ cursor: 'pointer' }} onClick={() => setProdSelected(row)} selected={prodSelected && row.id === prodSelected.id}>
															<TableCell>{row.name}</TableCell>
														</TableRow>
													)}
												/>
											</>
											:
											<>
												<ListItems
													id="pack-list"
													itemsPerPage={9}
													height={535}
													apiCall={PackService.getAll}
													CustomTableRow={({ row }) => (
														<TableRow hover sx={{ cursor: 'pointer' }} onClick={() => setPackSelected(row)} selected={packSelected && row.id === packSelected.id}>
															<TableCell>{row.description}</TableCell>
															<TableCell align="right">
																<DeleteOutlinedIcon onClick={() => handleDelete(row.id, row.description)} fontSize="small" sx={{ mr: 0.5, mb: -0.3, color: '#a00', '&:hover': { color: '#e00' } }} />
															</TableCell>
														</TableRow>
													)}
												/>
											</>
									}
								</Box>
							</Box>
						</Paper>
					</Box>
					<Paper variant="elevation" sx={{ backgroundColor: '#fff', mr: 4, px: 3, py: 1, mt: 1, width: '100%' }} >
						<Box display={'flex'} gap={2} height={'90%'} py={2} >
							<Box width={'100%'} height={'100%'} border={1} borderColor={'#ccc'} borderRadius={2} p={2} display={'flex'} flexDirection={'column'} justifyContent={'center'}>
								{!itemSelected &&
									<Box width={'100%'} height={'100%'} display={'flex'} flexDirection={'column'} justifyContent={'center'} alignItems={'center'}>
										<Typography variant="h6" color="text.secondary">
											Selecione um {mode === "Produtos" ? "produto" : "embalagem"} para ver os detalhes
										</Typography>
									</Box>
								}
								{prodSelected &&
									<Box width={'100%'} height={'100%'} display={'flex'} flexDirection={'column'} justifyContent={'center'}>
										<Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} mb={2}>
											<Typography variant="h5" color={prodSelected ? 'primary.main' : 'text.secondary'}>{prodSelected.name}</Typography>
											<Box display="flex" gap={2}>
												<Button variant="outlined" startIcon={<DeleteIcon />} color="error" onClick={handleRemoveRelationship}>Remover Relacionamento</Button>
												<ModalButton
													startIcon={<InventoryIcon />}
													onClose={() => {
														listReloadEvent.emit('packs-to-relate-modal');
													}}
													modalProps={assignProdModalProps}
												>
													Relacionar Embalagens
												</ModalButton>
											</Box>
										</Box>
										<ListItems
											id="packs-by-prod-list"
											minHeight={575}
											itemsPerPage={9}
											filters={{ prod_id: prodSelected.id }}
											apiCall={PackService.getPacksByProd}
											CustomTableRowHeader={() => (
												<TableRow>
													<TableCell>Descrição</TableCell>
													<TableCell>Quantidade</TableCell>
												</TableRow>
											)}
											CustomTableRow={({ row }) => (
												<TableRow
													hover
													sx={{ cursor: 'pointer' }}
													selected={removeSelected.includes(row.id)}
													onClick={() => {
														setRemoveSelected((prev) => {
															if (prev.includes(row.id)) {
																return prev.filter(id => id !== row.id);
															}
															return [...prev, row.id];
														});
													}}>
													<TableCell>{row.description}</TableCell>
													<TableCell><Typography color="primary">{row.prod_qnt}</Typography></TableCell>
												</TableRow>
											)}
										/>
									</Box>
								}
								{packSelected &&
									<Box width={'100%'} height={'100%'} display={'flex'} flexDirection={'column'} justifyContent={'center'}>
										<Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} mb={2}>
											<Typography variant="h5" color={packSelected ? 'primary.main' : 'text.secondary'}>{packSelected.description}</Typography>
											<Box display="flex" gap={2}>
												<Button variant="outlined" startIcon={<DeleteIcon />} color="error" onClick={handleRemoveRelationship}>Remover Relacionamento</Button>
												<ModalButton
													startIcon={<CategoryIcon />}
													onClose={() => {
														listReloadEvent.emit('prods-to-relate-modal');
													}}
													modalProps={assignPackModalProps}
												>
													Relacionar Produtos
												</ModalButton>
											</Box>
										</Box>
										<TextField size="small" placeholder="Pesquisar" fullWidth value={prodSearch} onChange={(e) => setProdSearch(e.target.value)} margin="normal" />
										<ListItems
											id="prods-by-pack-list"
											itemsPerPage={mode === "Produtos" ? 7 : 8}
											filters={{ pack_id: packSelected.id, prodName: prodSearch }}
											apiCall={PackService.getProdsByPack}
											CustomTableRowHeader={() => (
												<TableRow>
													<TableCell>Codigo</TableCell>
													<TableCell>Nome</TableCell>
												</TableRow>
											)}
											CustomTableRow={({ row }) => (
												<TableRow
													hover
													sx={{ cursor: 'pointer' }}
													selected={removeSelected.includes(row.id)}
													onClick={() => {
														setRemoveSelected((prev) => {
															if (prev.includes(row.id)) {
																return prev.filter(id => id !== row.id);
															}
															return [...prev, row.id];
														});
													}}>
													<TableCell>{row.code}</TableCell>
													<TableCell>{row.name}</TableCell>
												</TableRow>
											)}
										/>
									</Box>
								}
							</Box>
						</Box>
					</Paper>
				</Box >
			</LayoutMain >
		</>
	);
};