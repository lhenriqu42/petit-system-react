import {
	Box,
	Button,
	TableRow,
	TableCell,
	Typography,
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
import { IPurchaseCreateBody, PurchaseService } from "../../../shared/services/api/PurchaseService";
import { submitFormEvent } from "../../../shared/events/formEvents";
import { listReloadEvent } from "../../../shared/events/listEvents";
import { modalCloseEvent } from "../../../shared/events/modalEvents";

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

export const CreateModalContent: React.FC = () => {

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


	// SELECTED ITEMS
	const [prodSearch, setProdSearch] = useState("");
	const [selected, setSelected] = useState<ISelectedItem[]>(cachedItems());
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




	// CACHED ITEMS
	function cachedItems(): ISelectedItem[] {
		const cached = localStorage.getItem('purchase_create_selected_items');
		if (cached) {
			try {
				const parsed: ISelectedItem[] = JSON.parse(cached);
				return parsed;
			} catch {
				return [];
			}
		}
		return [];
	};
	useEffect(() => {
		localStorage.setItem('purchase_create_selected_items', JSON.stringify(selected));
	}, [selected]);

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
			// console.log('Rendering row for prod_id:', row.prod_id, 'with selected data:', selected);
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
	const SwalErrorf = (message: string, ...args: any[]) => {
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
				pack_id: item.data.mode === 'PACK' ? item.data.pack_id : undefined,
				quantity: item.data.quantity,
				price: BRLToN(item.data.price)
			}))
		};
		console.log('Submitting purchase with body:', body);
		const result = await PurchaseService.create(body);
		if (result instanceof Error) {
			SwalErrorf(result.message);
		} else {
			Swal.fire({
				icon: 'success',
				title: 'Sucesso',
				text: 'Compra criada com sucesso.',
				willClose: () => {
					modalCloseEvent.emit({ modalId: 'purchase_create_modal' });
					listReloadEvent.emit('purchase_list');
					setSelected([]);
				}
			});
		}
	}
	// SUBMIT EVENT
	useEffect(() => {
		const unsubscribe = submitFormEvent.on(({ formId }) => formId === 'purchase_create' && submit());
		return unsubscribe;
	}, [supplierSelected, selected]);

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
								<Box display={'flex'} alignItems={'center'}>
									<Typography>Valor Total:</Typography>
									<Typography ml={1} fontWeight={'bold'} color={totalValue > 0 ? 'success' : 'textPrimary'}>{nToBRL(totalValue)}</Typography>
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
							filters={{ search: prodSearch, orderByStock: true }}
							apiCall={ProductService.getAll}
							CustomTableRow={({ row }) => {
								const obj: ISelectedItem = {
									prod_id: row.id,
									prod_name: row.name,
									data: {
										mode: 'PACK',
										quantity: 1,
										price: nToBRL(row.last_price_purchased)
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
							<Button
								size="small"
								variant="contained"
								color="error"
								onClick={() => clearSelected()}
								startIcon={<BackspaceIcon />}>Limpar Tudo</Button>
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
				</Box>
			</Box >
		</Box >
	);
};





