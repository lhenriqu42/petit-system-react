import {
	Fab,
	Paper,
	TableRow,
	TableCell,
	Skeleton,
} from "@mui/material";
import { format } from 'date-fns';
import { LayoutMain } from "../../shared/layouts";
import { nToBRL } from "../../shared/services/formatters";
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { Link } from "react-router-dom";
import { PurchaseService } from "../../shared/services/api";
import { ListItems } from "../../shared/components/ListItems";

export const PurchasesList: React.FC = () => {
	return (
		<>
			<LayoutMain title="Compras" subTitle={"Gerencie as compras de produtos"}>
				<Paper variant="elevation" sx={{ backgroundColor: '#fff', mr: 4, px: 3, py: 1, mt: 1, width: 'auto' }}>
					<ListItems
						apiCall={PurchaseService.getAll}
						CustomTableRowHeader={() => (
							<TableRow>
								<TableCell>ID</TableCell>
								<TableCell>Fornecedor</TableCell>
								<TableCell>Valor Total</TableCell>
								<TableCell>Data</TableCell>
								<TableCell>Ações</TableCell>
							</TableRow>
						)}
						CustomTableRow={({ row }) => (
							<TableRow>
								<TableCell>{row.id}</TableCell>
								<TableCell>{row.supplier_name}</TableCell>
								<TableCell>{nToBRL(row.total_value)}</TableCell>
								<TableCell>{format(new Date(row.created_at), 'dd/MM/yyyy')}</TableCell>
								<TableCell>
									<Link to={`/purchases/${row.id}`}>
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