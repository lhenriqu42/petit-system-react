import {
	Box,
	Button,
	TableRow,
	TableCell,
	Typography,
	CircularProgress,
} from "@mui/material";
import { ListItems } from "../../../shared/components";
import { BRLToN, nToBRL } from "../../../shared/services/formatters";
import { ListArray } from "../../../shared/components/ListArray";
import { useCallback, useEffect, useRef, useState } from "react";
import { CustomTextField } from "../../../shared/forms/customInputs/CustomTextField";
import { ISupplier, ProductService, SupplierService } from "../../../shared/services/api";
import { CustomAutoComplete } from "../../../shared/forms/customInputs/CustomAutoComplete";
import BackspaceIcon from '@mui/icons-material/Backspace';
import { CustomRow } from "../Utils/CustomRow";
import Swal from "sweetalert2";
import { GetDetailsError, IPurchaseCreateBody, PurchaseService } from "../../../shared/services/api/PurchaseService";
import { submitFormEvent } from "../../../shared/events/formEvents";
import { listReloadEvent } from "../../../shared/events/listEvents";
import { modalCloseEvent } from "../../../shared/events/modalEvents";
import CachedIcon from '@mui/icons-material/Cached';
export interface ISelectedItem {
	prod_id: number;
	prod_name: string;
	data: ISelectedItemData;
}

export interface ISelectedItemData {
	mode: 'PACK' | 'PRODUCT';
	pack_id?: number;			// only if mode is PACK
	quantity: number;
	price: string;
}

type TCached = { selected: ISelectedItem[], sup: { id: number, label: string } };

export const EditModalContent: React.FC<{ purchaseId: number }> = ({ purchaseId }) => {
	useEffect(() => {
		// console.log('✅COMPONENTE MONTADO');
	}, []);
	const [prodSearch, setProdSearch] = useState("");
	// SELECTED ITEMS
	const [selected, setSelected] = useState<ISelectedItem[]>([]);
	const toggleSelect = (item: ISelectedItem) => {
		setSelected((prev) => {
			const exists = prev.find((i) => i.prod_id === item.prod_id);
			if (exists) {
				return prev.filter((i) => i.prod_id !== item.prod_id);
			} else {
				return [...prev, item];
			}
		});
	};

	// SUPPLIERS
	const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
	const [supplierSelected, setSupplierSelected] = useState<{ id: number; label: string }>({ id: -1, label: "" });

	const [loading, setLoading] = useState<boolean>(true);
	async function getCached(suppliers: ISupplier[]) {
		// console.log('Buscando cache para compra ID:', purchaseId);
		try {
			const selectedCached = JSON.parse(localStorage.getItem(`purchase_edit_selected_${purchaseId}`) || 'null');
			// // console.log(JSON.parse(localStorage.getItem(`purchase_edit_selected_${purchaseId}`) || 'null'));
			// // console.log({ selectedCached });
			const supCached = JSON.parse(localStorage.getItem(`purchase_edit_sup_${purchaseId}`) || 'null');
			const supSelect = supCached ? suppliers.find(sup => sup.id === supCached.id) : null;
			// console.log({ supSelect, selectedCached });
			if (supSelect && selectedCached) {
				return { selected: selectedCached, sup: { id: supSelect.id, label: supSelect.name } };
			}
			// console.log("🟡 Cache incompleto — buscando da API...");
			const result = await PurchaseService.getDetails(purchaseId);
			const selectedItems: ISelectedItem[] = result.items_summary.items.map(item => ({
				prod_id: item.prod_id,
				prod_name: item.prod_name,
				data: {
					mode: item.type,
					quantity: item.quantity,
					price: nToBRL(item.price),
					pack_id: item.pack_id || undefined,
				}
			}));
			const sup = suppliers.find(sup => sup.id === result.supplier.id);
			if (!sup) throw new GetDetailsError('Fornecedor da compra não encontrado. Compra corrompida!');
			// console.log("🟢 Fetch completo, sup:", sup);
			return { selected: selectedItems, sup: { id: sup.id, label: sup.name } };
		} catch (error) {
			console.error(error);
			if (error instanceof GetDetailsError) SwalErrorf(error.message);
			return null;
		}
	}
	const [reloadKey, setReloadKey] = useState<number>(0);
	useEffect(() => {
		// console.log('Carregando dados para edição...', { reloadKey });
		const fetchData = async () => {
			try {
				const sups = await SupplierService.getAll(undefined, undefined, 999999);
				if (sups instanceof Error) throw sups;
				// console.log('Fornecedores carregados:', sups.data.length);
				setSuppliers(sups.data);
				const cached: TCached | null = await getCached(sups.data);
				if (cached === null) return;
				// console.log('setting supplierSelected with:', cached.sup);
				setSupplierSelected(cached.sup);
				setSelected(cached.selected);
			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [reloadKey]);

	useEffect(() => {
		if (loading) return // console.log('💾❌! selected is empty:', selected);
		// console.log('💾 Salvando selected no localStorage:', selected);
		localStorage.setItem(`purchase_edit_selected_${purchaseId}`, JSON.stringify(selected));
	}, [selected, purchaseId]);
	useEffect(() => {
		if (loading) return // console.log('💾❌! supplierSelected: ', supplierSelected);
		// console.log('💾 Salvando supplierSelected no localStorage:', supplierSelected);
		localStorage.setItem(`purchase_edit_sup_${purchaseId}`, JSON.stringify(supplierSelected));
	}, [supplierSelected, purchaseId]);

	function clearCache() {
		// console.log('🧹 Limpando cache para compra ID:', purchaseId);
		localStorage.removeItem(`purchase_edit_selected_${purchaseId}`);
		localStorage.removeItem(`purchase_edit_sup_${purchaseId}`);
		listReloadEvent.emit('purchase_list', { page: 'current' });
		setReloadKey(prev => prev + 1);
	}





















	// CLEAR SELECTED
	const clearSelected = async () => {
		let timerInterval: number;
		const response = await Swal.fire({
			title: 'Tem certeza?',
			text: 'Isso irá remover todos os itens selecionados.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#d33',
			cancelButtonText: 'Cancelar',
			didOpen: () => {
				const confirmButton = Swal.getConfirmButton();
				if (confirmButton) {
					confirmButton.disabled = true; // Desabilita o botão inicialmente

					let timeLeft = 2;
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
		if (!response.isConfirmed) return;
		setSelected([]);
	};

	// TOTAL VALUE
	const [totalValue, setTotalValue] = useState<number>(0);
	useEffect(() => {
		let total = 0;
		selected.forEach((item) => {
			const price = BRLToN(item.data.price);
			total += price * item.data.quantity;
		});
		setTotalValue(total);
	}, [selected]);

	// UPDATE SELECTED DATA
	const updateSelectedData = useCallback(<K extends keyof ISelectedItemData>(prod_id: number, key: K, value: ISelectedItemData[K]) => {
		setSelected((prev) => {
			const next = prev.map((item) => {
				if (item.prod_id === prod_id) {
					return { ...item, data: { ...item.data, [key]: value } };
				}
				return item;
			});
			return next;
		});
	}, []);

	// RENDER ROW
	const selectedRef = useRef(selected);
	selectedRef.current = selected;
	const renderRow = useCallback(
		({ row }: { row: ISelectedItem }) => {
			const selected = selectedRef.current.find((i) => i.prod_id === row.prod_id);
			// // console.log('Rendering row for prod_id:', row.prod_id, 'with selected data:', selected);
			return (
				selected &&
				<CustomRow
					row={row}
					pack_id={selected.data.pack_id}
					mode={selected.data.mode}
					quantity={selected.data.quantity}
					price={selected.data.price}
					removeItem={toggleSelect}
					updateSelectedData={updateSelectedData}
				/>
			);
		},
		[updateSelectedData]
	);



	/*	SwalErrorf printa um alerta de erro formatado.
		ex: SwalErrorf('Erro ao processar o item %b com valor %s.', 'Item1', 100);
		%b -> negrito
		%s -> string normal                
	*/
	function SwalErrorf(message: string, ...args: any[]) {
		let i = 0;
		const formatted = message.replace(/%[sb]/g, (match) => {
			const arg = args[i++] ?? '';
			return match === '%b' ? `<b>${String(arg)}</b>` : String(arg);
		});

		Swal.fire({
			icon: 'error',
			title: 'Erro',
			html: formatted,
		});
	};

	const submit = async () => {
		if (!supplierSelected?.id || supplierSelected.id === -1) {
			SwalErrorf('Selecione um fornecedor.');
			return;
		}

		if (selected.length === 0) {
			SwalErrorf('Selecione pelo menos um produto.');
			return;
		}

		for (const item of selected) {
			if (item.data.quantity <= 0) {
				SwalErrorf(`A quantidade do produto %b deve ser maior que 0.`, item.prod_name);
				return;
			}
			if (item.data.mode === 'PACK' && !item.data.pack_id) {
				SwalErrorf(`Selecione uma embalagem para o produto: %b.`, item.prod_name);
				return;
			}
		}

		const body: IPurchaseCreateBody = {
			supplier_id: supplierSelected.id,
			purchases: selected.map(item => ({
				type: item.data.mode,
				prod_id: item.prod_id,
				pack_id: item.data.mode === 'PACK' ? item.data.pack_id! : undefined,
				quantity: item.data.quantity,
				price: BRLToN(item.data.price)
			}))
		};
		try {
			await PurchaseService.update(purchaseId, body);
			Swal.fire({
				icon: 'success',
				title: 'Sucesso',
				text: 'Compra editada com sucesso.',
				willClose: () => {
					modalCloseEvent.emit({ modalId: 'purchase_edit_modal' });
					clearCache();
					listReloadEvent.emit('purchase_list', { page: 'current' });
					setSelected([]);
				}
			});
		} catch (error) {
			if (error instanceof Error)
				SwalErrorf(error.message);
		}
	}
	// SUBMIT EVENT
	useEffect(() => {
		const unsubscribe = submitFormEvent.on(({ formId }) => formId === 'purchase_edit' && submit());
		return unsubscribe;
	}, [supplierSelected, selected]);
	return (
		<Box>
			<Box border={1} borderColor={'#ccc'} borderRadius={2} p={1} display={'flex'} mb={1} justifyContent={'center'} gap={2}>
				{loading
					?
					<Typography>Carregando...</Typography>
					:
					<>
						<Box width={"34%"}>
							<CustomAutoComplete
								callback={(target) => { if (target.id !== -1) setSupplierSelected(target) }}
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
											<Typography>Valor Total:</Typography>
											<Typography ml={1} fontWeight={'bold'} color={totalValue > 0 ? 'success' : 'textPrimary'}>{nToBRL(totalValue)}</Typography>
										</Box>
									</Box>
								);
							})()}
						</Box>
					</>
				}
			</Box>
			<Box border={2} p={1} borderColor={'#ccc'} borderRadius={2} gap={1} display={'flex'} flexDirection={'column'} height={740} >
				<Box display={'flex'} gap={2}>
					{loading
						?
						<Box flex={1} display="flex" justifyContent="center" alignItems="center" height={740}>
							<CircularProgress size={200} />
						</Box>
						:
						<>
							<Box width={'35%'} border={1} borderColor={'#ccc'} borderRadius={2} px={2} py={1} display={'flex'} flexDirection={'column'}>
								<Typography mb={1}>Produtos</Typography>
								<CustomTextField label={'Pesquisar'} size="small" value={prodSearch} onChange={(e) => setProdSearch(e.target.value)} sx={{ mb: 1 }} />
								<ListItems
									height={625}
									itemsPerPage={11}
									filters={{ search: prodSearch, orderByStock: true }}
									apiCall={ProductService.getAll}
									CustomTableRow={({ row }) => {
										const obj: ISelectedItem = {
											prod_id: row.id,
											prod_name: row.name,
											data: {
												mode: 'PACK',
												quantity: 1,
												price: nToBRL(0)
											}
										};
										return (
											<TableRow hover sx={{ cursor: 'pointer' }} onClick={() => toggleSelect(obj)} selected={selected.some(item => item.prod_id === row.id)}>
												<TableCell>{row.name}</TableCell>
												<TableCell align="right" sx={{ fontWeight: 700 }}>{row.stock}</TableCell>
											</TableRow>
										);
									}}
								/>
							</Box>
							<Box display="flex" flexDirection="column" gap={0.5} border={2} borderColor={'#555'} px={2} py={0} borderRadius={2} width={'100%'}>
								<Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} mt={0.5} pr={3}>
									<Typography variant="subtitle1" mt={0.5}>Itens Selecionados:</Typography>
									<Box display={'flex'} gap={5}>
										<Button
											size="small"
											variant="outlined"
											color="secondary"
											onClick={() => clearCache()}
											startIcon={<CachedIcon />}>Cancelar Edição</Button>
										<Button
											size="small"
											variant="contained"
											color="error"
											onClick={() => clearSelected()}
											startIcon={<BackspaceIcon />}>Limpar Tudo</Button>
									</Box>
								</Box>
								<Box border={1} borderColor={'#77f'} borderRadius={2} height={'100%'} pb={1} mb={1.5} sx={{ backgroundColor: '#fafafe' }}>
									<ListArray
										id='array-selected-items'
										itemsPerPage={8}
										customPlaceHolder="Nenhum item selecionado"
										height={680}
										items={selected}
										CustomTableRow={renderRow}
									/>
								</Box>
							</Box>
						</>
					}
				</Box>
			</Box >
		</Box >
	);
};