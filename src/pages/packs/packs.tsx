import {
	Box,
	Alert,
	Paper,
	Button,
	TableRow,
	TableCell,
	TextField,
	Typography,
} from "@mui/material";
import Swal from "sweetalert2";
import AddIcon from '@mui/icons-material/Add';
import { LayoutMain } from "../../shared/layouts";
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryIcon from '@mui/icons-material/Category';
import InventoryIcon from '@mui/icons-material/Inventory';
import { useEffect, useMemo, useRef, useState } from "react";
import { ListArray } from "../../shared/components/ListArray";
import { listReloadEvent } from "../../shared/events/listEvents";
import { ModalButton } from "../../shared/components/ModalButton";
import { modalCloseEvent } from "../../shared/events/modalEvents";
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { GetAllFunction, ListItems } from "../../shared/components/ListItems";
import { IProduct, ProductService, PackService } from "../../shared/services/api";
import { CustomTextField } from "../../shared/forms/customInputs/CustomTextField";
import { CustomButtonGroup } from "../../shared/forms/customInputs/CustomButtonGroup";
import { CreatePackModal } from "./CreateModal";




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








	// RELACIONAR EMBALAGENS / PRODUTOS -> PRODUTOS / EMBALAGENS
	const [relacionarSelected, setRelacionarSelected] = useState<number[]>([]);
	const submitRelacionar = async (modal_id: string) => {
		if (relacionarSelected.length === 0) {
			Swal.fire({
				icon: 'warning',
				title: 'Atenção',
				text: 'Nenhum item selecionado para relacionar.',
			});
			return;
		}
		try {
			let response: Promise<void | Error>;
			if (mode === "Produtos" && prodSelected) {
				response = PackService.putPacksInProd({
					prod_id: prodSelected.id,
					packs: relacionarSelected
				});
			} else if (mode === "Embalagens" && packSelected) {
				response = PackService.putProdsInPack({
					pack_id: packSelected.id,
					prods: relacionarSelected
				});
			}
			const result = await response!;
			if (result instanceof Error) {
				throw result;
			}
			listReloadEvent.emit(modal_id);
			Swal.fire({
				icon: 'success',
				title: 'Sucesso',
				text: 'Relação realizada com sucesso!',
				willClose: () => {
					modalCloseEvent.emit({ modalId: "*" });
					listReloadEvent.emit('*');
					setProdSearch("");
				}
			});
		} catch (error) {
			alert(error);
		}
	};












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
													modalProps={{
														submit: () => submitRelacionar('packs-to-relate-modal'),
														submitButtonProps: { Text: 'Relacionar' },
														title: 'Relacionar Embalagens',
														ModalContent: (
															<ModalRelacionar
																mode="pack"
																id="packs-to-relate-modal"
																apiCall={PackService.getAll}
																itemSelectedName={prodSelected.name}
																onChange={(selected) => setRelacionarSelected([...selected].map(([id, _]) => id))}
																filterId={prodSelected.id}
															/>
														),
													}}
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
													modalProps={{
														submit: () => submitRelacionar('prods-to-relate-modal'),
														submitButtonProps: { Text: 'Relacionar' },
														title: 'Relacionar Produtos',
														ModalContent: (
															<ModalRelacionar
																mode="prod"
																id="prods-to-relate-modal"
																apiCall={PackService.getAllProducts}
																itemSelectedName={packSelected.description}
																onChange={(selected) => setRelacionarSelected([...selected].map(([id, _]) => id))}
																filterId={packSelected.id}
															/>
														),
													}}
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



interface ModalRelacionarProps<TData, TFilter = undefined> {
	id?: string;
	apiCall: GetAllFunction<TData, TFilter>;
	filterId: number;
	onChange?: (selected: Map<number, string>) => void;
	itemSelectedName: string;
	mode: 'prod' | 'pack';
}
export function ModalRelacionar<TData, TFilter = undefined>({ apiCall, itemSelectedName, onChange, filterId, id, mode }: ModalRelacionarProps<TData, TFilter>) {

	const [selected, setSelected] = useState<Map<number, string>>(new Map());

	const toggleSelect = ({ id, name }: { id: number, name: string }) => {
		setSelected((prev) => {
			const next = new Map(prev);
			if (next.has(id)) next.delete(id);
			else next.set(id, name);
			return next;
		});
	};

	useEffect(() => {
		onChange?.(selected);
	}, [selected]);

	useEffect(() => {
		const unsubscribe = listReloadEvent.on((target) => {
			if (target == "*" || target == id) {
				setSelected(new Map());
			}
		});
		return unsubscribe; // remove listener ao desmontar
	}, []);

	const [search, setSearch] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);
	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus();
		}
	}, []);
	const filters = useMemo(() => ({ id: filterId, prodName: search }), [filterId, search]);
	return (
		<Box display="flex" gap={2}>
			<Box display="flex" flexDirection="column" gap={1} border={2} borderColor={'#555'} p={2} borderRadius={2} width={'50%'}>
				<Box mb={1}>
					<Typography variant="subtitle1">{mode === 'prod' ? 'Selecione os Produtos que deseja relacionar com a Embalagem:' : 'Selecione as Embalagens que deseja relacionar com o Produto:'}</Typography>
					<Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
						<Typography variant="h6" color="primary" fontWeight={650}>{itemSelectedName}</Typography>
						<CreatePackModal />
					</Box>
				</Box>
				<Box border={1} borderColor={'#ccc'} borderRadius={2} height={450} pb={3}>
					{
						mode === 'prod' &&
						<Box p={1}>
							<CustomTextField
								inputRef={inputRef}
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								size="small"
								label="Pesquisar Produtos"
							/>
						</Box>
					}
					<ListItems
						itemsPerPage={mode === 'prod' ? 7 : 8}
						height={mode === 'prod' ? 410 : 466}
						id={id}
						apiCall={apiCall}
						filters={filters as any}
						CustomTableRow={({ row }) => {
							const { id, description, name } = row as any;
							const item = { id, name: description ?? name };
							return (
								<TableRow hover sx={{ cursor: 'pointer' }} onClick={() => toggleSelect(item)} selected={selected.has(item.id)}>
									<TableCell>{item.name}</TableCell>
								</TableRow>
							);
						}}
					/>
				</Box>
			</Box>
			<Box display="flex" flexDirection="column" gap={1} border={2} borderColor={'#555'} p={2} borderRadius={2} width={'50%'}>

				<Typography variant="subtitle1">{mode === 'prod' ? 'Produtos Selecionados:' : 'Embalagens Selecionadas:'}</Typography>
				<Box border={1} borderColor={'#77f'} borderRadius={2} height={487} pb={3} sx={{ backgroundColor: '#fafafe' }}>
					<ListArray
						itemsPerPage={8}
						customPlaceHolder="Nenhum item selecionado"
						minHeight={467}
						id={id}
						items={[...selected.entries()].map(([id, name]) => ({ id, name }))}
						CustomTableRow={({ row }) => {
							return (
								<TableRow hover sx={{ cursor: 'default' }}>
									<TableCell>
										{row.name.split(/(\d+)/).map((part, i) =>
											/\d+/.test(part) ? (
												<Typography component="span" key={i} color="secondary" fontWeight={700}>
													{part}
												</Typography>
											) : (
												<span key={i}>{part}</span>
											)
										)}
									</TableCell>
								</TableRow>
							);
						}}
					/>
				</Box>
			</Box>
		</Box>
	);
}
