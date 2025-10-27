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
	CircularProgress
} from "@mui/material";
import './../../shared/css/sweetAlert.css';
import { useEffect, useMemo, useState, useId } from "react";
import { Environment } from "../environment";
import { useSearchParams } from "react-router-dom";

type GetAllFunction<TData, TFilter = undefined> = (
	page?: number,
	limit?: number,
	filter?: TFilter
) => Promise<{ data: TData[]; totalCount: number } | Error>;

interface PaginationProps<TData, TFilter = undefined> {
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
}

export function ListItems<TData, TFilter = undefined>({
	apiCall,
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
	}


}: PaginationProps<TData, TFilter>) {
	const uniqueId = useId();
	const NUMBER_OF_SKELETONS = Array(itemsPerPage).fill(null);

	const theme = useTheme();
	const smDown = useMediaQuery(theme.breakpoints.down('sm'));

	const [searchParams, setSearchParams] = useSearchParams();
	const [rows, setRows] = useState<TData[]>([]);
	const [totalCount, setTotalCount] = useState(0);
	const [loading, setLoading] = useState(true);

	const page = useMemo(() => Number(searchParams.get('page' + uniqueId) || '1'), [searchParams]);

	const list = async () => {
		setLoading(true);
		try {
			const result = await apiCall(page, itemsPerPage, filters);
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

	useEffect(() => {
		list();
	}, [page, filters]);

	useEffect(() => {
		setSearchParams((old) => {
			old.set("page" + uniqueId, "1");
			return old;
		});
	}, [filters]);

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
									(row) => (
										<CustomTableRow key={JSON.stringify(row)} row={row} />
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
			<Box height={32} display={'flex'} alignItems={'center'}>
				{(totalCount > 0 && totalCount > itemsPerPage) && (
					<Pagination
						disabled={loading}
						page={Number(page)}
						count={Math.ceil(totalCount / itemsPerPage)}
						onChange={(_, newPage) =>
							setSearchParams((old) => {
								old.set("page" + uniqueId, newPage.toString());
								return old;
							})
						}
						siblingCount={smDown ? 0 : 1}
						size={size}
					/>
				)}
			</Box>
		</Box>
	);
}
