import {
	Box,
	Fab,
	Icon,
	Paper,
	TableCell,
	TableRow,
	Typography,
} from "@mui/material";
import { LayoutMain } from "../../shared/layouts";
import { ListItems } from "../../shared/components";
import { ProductService, StockService } from "../../shared/services/api";
import { memo, useState } from "react";
import { CustomTextField } from "../../shared/forms/customInputs/CustomTextField";
import Swal from "sweetalert2";
import { listReloadEvent } from "../../shared/events/listEvents";
interface RowProps {
	row: any;
	editId: number | null;
	setEditId: (id: number | null) => void;
	valueDefault?: number;
}
const Row = memo<RowProps>(({ row, editId, setEditId, valueDefault }) => {
	const [editStock, setEditStock] = useState<number | null>(valueDefault ?? null);
	const handleEditConfirm = async () => {
		setTimeout(async () => {
			if (editStock === null || editStock < 0) return Swal.fire('Estoque inválido.');

			const result = await Swal.fire({
				title: 'Tem certeza?',
				text: `Você está prestes a atualizar o estoque de "${row.name}" para ${editStock}.`,
				icon: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				confirmButtonText: 'Sim, atualizar!',
				cancelButtonText: 'Cancelar',
			});
			if (!result.isConfirmed) return;
			Swal.fire({
				title: 'Atualizando estoque...',
				didOpen: async () => {
					Swal.showLoading();
					await StockService.updateTo(row.id, editStock);
					Swal.close();
					Swal.fire('Atualizado!', 'O estoque foi atualizado com sucesso.', 'success');
					listReloadEvent.emit('stock-list');
					setEditId(null);
				},
				allowOutsideClick: false,
			});
		}, 50);
	}


	return (
		<TableRow>
			<TableCell>{row.name}</TableCell>
			{editId === row.id ? (
				<>
					<TableCell>
						<CustomTextField
							unsigned
							autoFocus
							type="number"
							sx={{ width: 200 }}
							valueDefault={valueDefault?.toString() ?? ""}
							onChange={e => setEditStock(parseInt(e.target.value))}
							onKeyDown={e => { if (e.code === 'Enter' || e.key === 'Enter') handleEditConfirm(); }}
						/>
					</TableCell>

					<TableCell sx={{ display: 'flex', gap: 1 }}>
						<Fab color="success" onClick={handleEditConfirm}>
							<Icon>check</Icon>
						</Fab>
						<Fab color="error" onClick={() => setEditId(null)}>
							<Icon>cancel</Icon>
						</Fab>
					</TableCell>
				</>
			) : (
				<>
					<TableCell>{row.stock}</TableCell>
					<TableCell>
						<Fab
							color="warning"
							onClick={() => {
								setEditStock(row.stock ?? 0);
								setEditId(row.id);
							}}
						>
							<Icon>edit</Icon>
						</Fab>
					</TableCell>
				</>
			)}
		</TableRow>
	);
});




export const Stock: React.FC = () => {
	const [prodFilter, setProdFilter] = useState({ search: '', orderByStock: false });
	const [editId, setEditId] = useState<number | null>(null);
	return (
		<LayoutMain title="Estoque" subTitle="Adicione ou gerencie o estoque">
			<Paper sx={{ backgroundColor: "#fff", px: 3, py: 1, mr: 5, mb: 1 }} variant="elevation">
				<Box display={'flex'} alignItems={'center'} gap={5}>
					<CustomTextField
						size="small"
						sx={{ width: 300 }}
						label="Filtrar por nome"
						value={prodFilter.search}
						onChange={e => setProdFilter({ ...prodFilter, search: e.target.value })}
					/>
					<Box>
						<Typography variant="subtitle1" component="span" mr={2}>Ordenar por estoque:</Typography>
						<Fab
							color={prodFilter.orderByStock ? "success" : "warning"}
							sx={{ color: prodFilter.orderByStock ? "white" : "black" }}
							aria-label="sort"
							size="small"
							onClick={() => setProdFilter({ ...prodFilter, orderByStock: !prodFilter.orderByStock })}
						>
							<Icon>sort</Icon>
						</Fab>
					</Box>
				</Box>
			</Paper>
			<Paper sx={{ backgroundColor: "#fff", px: 3, py: 3, mr: 5, mb: 1 }} variant="elevation">
				<ListItems
					id="stock-list"
					minHeight={700}
					useAsKey={'id'}
					apiCall={ProductService.getAll}
					filters={{ search: prodFilter.search, orderByStock: prodFilter.orderByStock }}
					CustomTableRowHeader={() =>
						<TableRow>
							<TableCell>Nome</TableCell>
							<TableCell>Estoque</TableCell>
							<TableCell>Ações</TableCell>
						</TableRow>
					}
					CustomTableRow={({ row }) => (
						<Row
							row={row}
							editId={editId}
							setEditId={setEditId}
							valueDefault={row.stock}
						/>
					)}
				/>
			</Paper>
		</LayoutMain >
	);
};
