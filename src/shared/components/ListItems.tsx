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
import { useEffect, useMemo, useState } from "react";
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
	minHeight?: number;
	CustomTableRow: React.FC<{ row: TData }>;
	CustomTableRowHeader: React.FC;
	CustomTableSkeleton?: React.FC;
}

export function ListItems<TData, TFilter = undefined>({
	apiCall,
	itemsPerPage = Environment.LIMITE_DE_LINHAS,
	filters,
	minHeight = 625,
	CustomTableRow,
	CustomTableRowHeader,
	CustomTableSkeleton = function () {
		return (
			<TableRow>
				<TableCell colSpan={6}>
					<CircularProgress />
				</TableCell>
			</TableRow>
		);
	}


}: PaginationProps<TData, TFilter>) {
	const NUMBER_OF_SKELETONS = Array(itemsPerPage).fill(null);

	const theme = useTheme();
	const smDown = useMediaQuery(theme.breakpoints.down('sm'));

	const [searchParams, setSearchParams] = useSearchParams();
	const [rows, setRows] = useState<TData[]>([]);
	const [totalCount, setTotalCount] = useState(0);
	const [loading, setLoading] = useState(true);

	const page = useMemo(() => Number(searchParams.get('page') || '1'), [searchParams]);

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

	return (
		<div>
			<Box minHeight={minHeight}>
				<TableContainer>
					<Table sx={{ minWidth: smDown ? 200 : 650 }} aria-label="simple table">
						<TableHead>
							<CustomTableRowHeader />
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
							<caption>Nenhuma venda efetuada</caption>
						)}
					</Table>
				</TableContainer>
			</Box>
			{(totalCount > 0 && totalCount > Environment.LIMITE_DE_LINHAS) && (
				<Pagination
					page={Number(page)}
					count={Math.ceil(totalCount / Environment.LIMITE_DE_LINHAS)}
					onChange={(_, newPage) =>
						setSearchParams((old) => {
							old.set("page", newPage.toString());
							return old;
						})
					}
					siblingCount={smDown ? 0 : 1}
				/>
			)}
		</div>
	);
}
