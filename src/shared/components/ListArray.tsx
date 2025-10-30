import {
	Box,
	Table,
	useTheme,
	TableHead,
	TableBody,
	Pagination,
	useMediaQuery,
	TableContainer,
} from "@mui/material";
import './../../shared/css/sweetAlert.css';
import { useEffect, useState } from "react";
import { Environment } from "../environment";
import { listReloadEvent } from "../../shared/events/listReload";

interface PaginationProps<TData> {
	items: TData[];
	eventName?: string;
	itemsPerPage?: number;
	minHeight?: number | string;
	height?: number | string;
	CustomTableRow: React.FC<{ row: TData }>;
	customPlaceHolder?: string;
	CustomTableRowHeader?: React.FC;
	size?: "small" | "medium" | "large";
	id?: string;
}

export function ListArray<TData>({
	id,
	items,
	itemsPerPage = Environment.LIMITE_DE_LINHAS,
	customPlaceHolder = "Nenhum dado encontrado.",
	minHeight,
	CustomTableRow,
	height = '100%',
	CustomTableRowHeader,
	size = "medium",


}: PaginationProps<TData>) {
	const theme = useTheme();
	const smDown = useMediaQuery(theme.breakpoints.down('sm'));

	const [rows, setRows] = useState<TData[]>([]);
	const [totalCount, setTotalCount] = useState(0);

	const [page, setPage] = useState(1);

	const list = async () => {
		const startIndex = (page - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		// console.log(items);
		const result = {
			data: items.slice(startIndex, endIndex),
			totalCount: items.length
		};
		if (result.data.length === 0 && result.totalCount > 0) {
			setPage(() => {
				const lastPage = Math.ceil(result.totalCount / itemsPerPage);
				return lastPage;
			});
			return;
		}
		setRows(result.data);
		setTotalCount(result.totalCount);
	};

	useEffect(() => {
		list();
	}, [page, items]);

	useEffect(() => {
		const unsubscribe = listReloadEvent.on((target) => {
			if (target == "*" || target == id) {
				list();
			}
		});
		return unsubscribe; // remove listener ao desmontar
	}, []);

	return (
		<Box height={height} display={'flex'} flexDirection={'column'} justifyContent={'space-between'}>
			<Box minHeight={minHeight} height={'100%'} sx={{ position: 'relative' }}>
				<TableContainer>
					<Table aria-label="simple table">
						<TableHead>
							{CustomTableRowHeader && <CustomTableRowHeader />}
						</TableHead>

						<TableBody>
							{
								rows?.map(
									(row) => (
										<CustomTableRow key={JSON.stringify(row)} row={row} />
									)
								)
							}
						</TableBody>

						{totalCount === 0 && (
							<caption>{customPlaceHolder}</caption>
						)}
					</Table>
				</TableContainer>
			</Box>
			<Box height={32} display={'flex'} alignItems={'center'}>
				{(totalCount > 0 && totalCount > itemsPerPage) && (
					<Pagination
						page={Number(page)}
						count={Math.ceil(totalCount / itemsPerPage)}
						onChange={(_, newPage) =>
							setPage(newPage)
						}
						siblingCount={smDown ? 0 : 1}
						size={size}
					/>
				)}
			</Box>
		</Box>
	);
}
