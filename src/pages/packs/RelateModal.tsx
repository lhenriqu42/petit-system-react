import {
	Box,
	TableRow,
	TableCell,
	Typography,
} from "@mui/material";
import Swal from "sweetalert2";
import { useState } from "react";
import { CreatePackModal } from "./CreateModal";
import { useEffect, useMemo, useRef } from "react";
import { PackService } from "../../shared/services/api";
import { GetAllFunction, ListItems } from "../../shared/components";
import { ListArray } from "../../shared/components/ListArray";
import { listReloadEvent } from "../../shared/events/listEvents";
import { modalCloseEvent } from "../../shared/events/modalEvents";
import { CustomTextField } from "../../shared/forms/customInputs/CustomTextField";




// RELACIONAR EMBALAGENS / PRODUTOS -> PRODUTOS / EMBALAGENS
type TCallback = () => void;
type TErrorCallback = (error: any) => void;
const submitRelacionar = async ({ modal_id, item_id, mode }: { modal_id: string, item_id: number, mode: 'prod' | 'pack' }, relacionarSelected: number[], successCallback?: TCallback, errorCallback?: TErrorCallback) => {
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
		if (mode === 'pack') {
			response = PackService.putPacksInProd({
				prod_id: item_id,
				packs: relacionarSelected
			});
		} else if (mode === 'prod') {
			response = PackService.putProdsInPack({
				pack_id: item_id,
				prods: relacionarSelected
			});
		}
		const result = await response!;
		if (result instanceof Error) {
			throw result;
		}
		Swal.fire({
			icon: 'success',
			title: 'Sucesso',
			text: 'Relação realizada com sucesso!',
			willClose: () => {
				modalCloseEvent.emit({ modalId: modal_id });
				successCallback?.();
			}
		});
	} catch (error) {
		console.error(error);
		errorCallback?.(error);
	}
};


export const useAssignModalProps = (
	{ id, label, mode }: { id: number; label: string; mode: 'prod' | 'pack' },
	successCallback?: TCallback,
	errorCallback?: TErrorCallback
) => {
	const [relacionarSelected, setRelacionarSelected] = useState<number[]>([]);
	const modal_id = 'relate-modal-' + String(id);

	return useMemo(() => ({
		id: modal_id,
		submit: () => submitRelacionar(
			{ modal_id, item_id: id, mode },
			relacionarSelected,
			successCallback,
			errorCallback
		),
		submitButtonProps: { Text: 'Relacionar' },
		title: 'Relacionar Embalagens',
		ModalContent: (
			<ModalRelacionar
				mode={mode}
				id={modal_id}
				apiCall={
					mode === 'pack'
						? (PackService.getAll as GetAllFunction<any, any>)
						: (PackService.getAllProducts as GetAllFunction<any, any>)
				}
				itemSelectedName={label}
				onChange={(selected) =>
					setRelacionarSelected([...selected].map(([id, _]) => id))
				}
				filterId={id}
			/>
		),
	}), [id, label, mode, relacionarSelected]);
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
						{ mode === 'pack' && <CreatePackModal callback={() => listReloadEvent.emit(id ?? 'N/A')} />}
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
