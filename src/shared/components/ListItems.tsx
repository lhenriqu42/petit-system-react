import {
	Box,
	Table,
	useTheme,
	TableRow,
	TableHead,
	TableCell,
	TableBody,
	Pagination,
	useMediaQuery,
	TableContainer,
	CircularProgress,
	SxProps,
} from "@mui/material";
import './../../shared/css/sweetAlert.css';
import { useState } from "react";
import { Environment } from "../environment";
import { listReloadEvent } from "../events/listEvents";
import { useDeepEffect } from '../../shared/hooks/UseDeepEffect';

export type GetAllFunction<TData, TFilter = undefined> = (
	page?: number,
	limit?: number,
	filter?: TFilter
) => Promise<{ data: TData[]; totalCount: number } | Error>;

interface PaginationProps<TData, TFilter = undefined> {
	useAsKey?: keyof TData | ((item: TData, index: number) => string | number) | 'index';
	apiCall: GetAllFunction<TData, TFilter>;
	itemsPerPage?: number;
	filters?: TFilter;
	minHeight?: number | string;
	height?: number | string;
	CustomTableRow: React.FC<{ row: TData }>;
	CustomTableRowHeader?: React.FC;
	CustomTableSkeleton?: React.FC;
	CircularProgressSize?: number;
	size?: "small" | "medium" | "large";
	id?: string;
	pagSx?: SxProps;
}

export function ListItems<TData, TFilter = undefined>({
	apiCall,
	id,
	pagSx,
	CircularProgressSize = 13,
	itemsPerPage = Environment.LIMITE_DE_LINHAS,
	filters,
	minHeight,
	CustomTableRow,
	height = '100%',
	CustomTableRowHeader,
	size = "medium",
	CustomTableSkeleton = function () {
		return (
			<TableRow>
				<TableCell colSpan={6}>
					<CircularProgress size={CircularProgressSize} />
				</TableCell>
			</TableRow>
		);
	},
	useAsKey = (row: TData) => JSON.stringify(row)
}: PaginationProps<TData, TFilter>) {
	const NUMBER_OF_SKELETONS = Array(itemsPerPage).fill(null);
	const theme = useTheme();
	const smDown = useMediaQuery(theme.breakpoints.down('sm'));

	const [rows, setRows] = useState<TData[]>([]);
	const [totalCount, setTotalCount] = useState(0);
	const [loading, setLoading] = useState(true);

	const [page, setPage] = useState(1);

	const list = async (pageArg = page, filtersArg = filters) => {
		setLoading(true);
		try {
			const result = await apiCall(pageArg, itemsPerPage, filtersArg);
			if (result instanceof Error) {
				alert(result.message);
			} else {
				setRows(result.data);
				setTotalCount(result.totalCount);
			}
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	};


	useDeepEffect(() => {
		list(page, filters);
	}, [page, filters]);

	useDeepEffect(() => {
		setPage(1);
	}, [filters]);

	useDeepEffect(() => {
		const unsubscribe = listReloadEvent.on((target, props) => {
			if (target == "*" || target == id) {
				const page = props?.page ?? 1;
				if (page === 'current') return list();
				list(page, filters);
			}
		});
		return unsubscribe; // remove listener ao desmontar
	}, [filters, page, id]);

	return (
		<Box height={height} display={'flex'} flexDirection={'column'} justifyContent={'space-between'}>
			<Box minHeight={minHeight} height={'100%'} sx={{ position: 'relative' }}>
				<TableContainer>
					<Table aria-label="simple table">
						<TableHead>
							{CustomTableRowHeader && <CustomTableRowHeader />}
						</TableHead>

						<TableBody>
							{!loading ?
								rows?.map(
									(row, index) => (
										<CustomTableRow key={typeof useAsKey === 'function' ? useAsKey(row, index) : useAsKey === 'index' ? index : row[useAsKey] as string | number} row={row} />
									)
								)
								:
								NUMBER_OF_SKELETONS.map((_, index) => (
									<CustomTableSkeleton key={index} />
								))
							}
						</TableBody>

						{totalCount === 0 && !loading && (
							<caption>Nenhum registro encontrado</caption>
						)}
					</Table>
				</TableContainer>
			</Box>
			<Box height={32} display={'flex'} alignItems={'center'} sx={pagSx}>
				{(totalCount > 0 && totalCount > itemsPerPage) && (
					<Pagination
						disabled={loading}
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
