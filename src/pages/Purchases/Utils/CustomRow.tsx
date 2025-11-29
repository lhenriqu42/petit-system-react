import {
	Box,
	TableRow,
	TableCell,
	TextField,
	Typography,
} from "@mui/material";
import { memo, useEffect, useState } from "react";
import InventoryIcon from '@mui/icons-material/Inventory';
import { PackService } from "../../../shared/services/api";
import { ModalButton } from "../../../shared/components/ModalButton";
import { BRLToN, nToBRL } from "../../../shared/services/formatters";
import { ISelectedItem, ISelectedItemData } from "../Modals/ModalCreate";
import { CustomSelect } from "../../../shared/forms/customInputs/CustomSelect";
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import { CustomButtonGroup } from "../../../shared/forms/customInputs/CustomButtonGroup";
import { useAssignModalProps } from "../../packs/RelateModal";
import { listReloadEvent } from "../../../shared/events/listEvents";

interface CustomRowProps {
	row: ISelectedItem;
	mode?: 'PACK' | 'PRODUCT';
	quantity?: number;
	price?: string;
	removeItem: (item: ISelectedItem) => void;
	pack_id?: number;
	updateSelectedData: <K extends keyof ISelectedItemData>(prod_id: number, key: K, value: ISelectedItemData[K]) => void;
}

export const CustomRow = memo(function CustomRow({ row, mode, quantity, price, pack_id, updateSelectedData, removeItem }: CustomRowProps) {

	const [packs, setPacks] = useState<{ text: string; value: string }[]>([{ text: 'Carregando...', value: '' }]);
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		const fetchPacks = async () => {
			setLoading(true);
			const packsResult = await PackService.getPacksByProd(1, 99999999, { prod_id: row.prod_id });
			if (packsResult instanceof Error) {
				console.error(packsResult);
				alert('Erro ao buscar embalagens para o produto id: ' + row.prod_id + ' Name: ' + row.prod_name);
				return;
			}
			if (packsResult.data.length === 0) {
				setPacks([{ text: 'Nenhuma embalagem encontrada', value: '' }]);
			} else {
				if (!pack_id)
					updateSelectedData(row.prod_id, 'pack_id', Number(packsResult.data[0].id));
				setPacks(packsResult.data.map((pack) => ({ text: pack.description.slice(14), value: String(pack.id) })));
			}
			setLoading(false);
		};
		fetchPacks();
	}, []);


	// UTILS
	const handleCashChange = (string: string) => {
		const rawValue = string.replace(/[^0-9]/g, '');
		const numericValue = Number(rawValue) / 100;
		const formattedValue = nToBRL(numericValue);
		return (formattedValue);
	};

	const assignModalProps = useAssignModalProps({ mode: 'pack', id: row.prod_id, label: row.prod_name }, () => { listReloadEvent.emit('array-selected-items'); });
	return (
		<TableRow hover sx={{ cursor: 'default', height: 80 }}>
			<TableCell width={200}>
				{row.prod_name.split(/(\d+)/).map((part, i) =>
					/\d+/.test(part) ? (
						<Typography component="span" key={i} color="secondary" fontWeight={700}>
							{part}
						</Typography>
					) : (
						<span key={i}>{part}</span>
					)
				)}
			</TableCell>


			<TableCell width={100}>
				<CustomButtonGroup
					key={row.prod_id}
					size="small"
					variant="outlined"
					buttons={[{ label: 'Embalagem' }, { label: 'Unitario' }]}
					selected={
						mode === 'PACK'
							? { label: 'Embalagem' }
							: { label: 'Unitario' }
					}
					onChange={(selected) => {
						if (!selected) return;
						const newMode = selected.label === 'Embalagem' ? 'PACK' : 'PRODUCT';
						updateSelectedData(row.prod_id, 'mode', newMode);
					}}
				/>
			</TableCell>

			<TableCell width={250}>
				<Box display="flex" alignItems="self-start" gap={1}>
					{mode === 'PACK' &&
						(
							packs[0].text === 'Nenhuma embalagem encontrada' ?
								(
									<ModalButton
										startIcon={<InventoryIcon />}
										size="small"
										modalProps={assignModalProps}
									>
										Relacionar Embalagens
									</ModalButton>
								)
								:
								(
									<CustomSelect
										disabled={loading}
										label="Embalagem"
										required
										defaultSelected={loading ? 0 : pack_id ? packs.findIndex(item => item.value === String(pack_id)) : 0}
										minWidth={180}
										maxWidth={180}
										borderColor={{
											normal: '#1976d2',
											hover: '#115293',
											focused: '#0d3c71',
										}}
										size="small"
										menuItens={packs}
										onValueChange={(selectedValue) => {
											updateSelectedData(row.prod_id, 'pack_id', Number(selectedValue));
										}}
									/>
								)
						)
					}
				</Box>
			</TableCell>

			<TableCell width={170}>
				<TextField
					size="small"
					type="number"
					label="Quantidade"
					value={quantity ?? ''}
					onChange={(e) =>
						updateSelectedData(row.prod_id, 'quantity', Number(e.target.value.replace(/-/g, '')))
					}
				/>
			</TableCell>

			<TableCell width={200}>
				<TextField
					size="small"
					label="Preço Unitário"
					value={price || nToBRL(0)}
					onChange={(e) =>
						updateSelectedData(row.prod_id, 'price', handleCashChange(e.target.value))
					}
				/>
			</TableCell>

			<TableCell width={80}>
				<Typography fontSize={11.5}>Total:</Typography>
				<Typography fontSize={14} fontWeight={700}>
					{
						price === undefined || quantity === undefined ? '-' : (
							nToBRL(BRLToN(price) * quantity).split(/(\d+)/).map((part, i) =>
								/\d+/.test(part) ? (
									<Typography component="span" key={i} color="secondary" fontWeight={700}>
										{part}
									</Typography>
								) : (
									<span key={i}>{part}</span>
								)
							)
						)
					}
				</Typography>
			</TableCell>

			<TableCell width={80}>
				<DeleteForeverOutlinedIcon color="error" sx={{ cursor: 'pointer' }} onClick={() => removeItem(row)} />
			</TableCell>
		</TableRow>
	);
},
	(prev, next) => {
		return (
			prev.mode === next.mode &&
			prev.quantity === next.quantity &&
			prev.price === next.price &&
			prev.row.prod_id === next.row.prod_id &&
			prev.pack_id === next.pack_id
		);
	}
);