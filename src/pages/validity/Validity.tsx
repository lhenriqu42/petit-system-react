import {
	Fab,
	Box,
	Grid,
	Paper,
	Alert,
	Table,
	Button,
	Snackbar,
	TableRow,
	TextField,
	TableBody,
	TableCell,
	TableHead,
	Typography,
	Pagination,
} from "@mui/material";
import * as yup from 'yup';
import Swal from "sweetalert2";
import AddIcon from '@mui/icons-material/Add';
import UndoIcon from "@mui/icons-material/Undo";
import { useDebounce } from "../../shared/hooks";
import { LayoutMain } from "../../shared/layouts";
import { useSearchParams } from "react-router-dom";
import RemoveIcon from "@mui/icons-material/Remove";
import { useEffect, useMemo, useRef, useState } from "react";
import { format, addDays, isDate, differenceInDays, startOfDay } from 'date-fns';
import { IProduct, IProductWithValidity, ProductService, ValidityService } from "../../shared/services/api";

const VALIDITY_ROW_LIMIT = 6;
const PRODUCT_ROW_LIMIT = 9;

const validitySchema = yup.object().shape({
	validity: yup.date().required()
});

export const Validity: React.FC = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const { debounce } = useDebounce();

	const inputDate = useRef<HTMLInputElement>();

	const [prodTotalCount, setProdTotalCount] = useState(0);
	const [loadingPageProd, setLoadingPageProd] = useState(false);
	const [loadingPageVal, setLoadingPageVal] = useState(false);
	const [prodRows, setProdRows] = useState<IProduct[]>([]);
	const [prodSelectedRow, setProdSelectedRow] = useState(0);

	const prodPage = useMemo(() => {
		return searchParams.get('prodPage') || 1;
	}, [searchParams]);

	const prodSearch = useMemo(() => {
		return searchParams.get('prodSearch') || '';
	}, [searchParams]);

	useEffect(() => {
		debounce(() => {
			listProducts();
		})

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [prodPage, prodSearch])

	const listProducts = async () => {
		setLoadingPageProd(true);
		const response = await ProductService.getAll(Number(prodPage), PRODUCT_ROW_LIMIT, prodSearch);
		if (response instanceof Error) return alert('Erro ao procurar por produtos');
		setProdRows(response.data);
		setProdTotalCount(response.totalCount);
		setLoadingPageProd(false);
	}


	const [valRows, setValRows] = useState<IProductWithValidity[]>([]);
	const [valTotalCount, setValTotalCount] = useState(0);

	const ValidityPage = useMemo(() => {
		return searchParams.get('ValidityPage') || 1;
	}, [searchParams]);

	useEffect(() => {
		listValidities();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ValidityPage, prodSelectedRow])

	const listValidities = async () => {
		setLoadingPageVal(true);
		if (prodSelectedRow) {
			const response = await ValidityService.getAllByProd(Number(ValidityPage), VALIDITY_ROW_LIMIT, prodSelectedRow);
			if (response instanceof Error) return alert('Erro ao procurar por validades');
			setValRows(response.data);
			setValTotalCount(response.totalCount);
		} else {
			const response = await ValidityService.getAll(Number(ValidityPage), VALIDITY_ROW_LIMIT);
			if (response instanceof Error) return alert('Erro ao procurar por validades');
			setValRows(response.data);
			setValTotalCount(response.totalCount);
		}
		setLoadingPageVal(false);
	}


	const [validity, setValidity] = useState<Date>();
	const [openSnackError, setOpenSnackError] = useState(false);

	const handleProdRowClick = (id: number) => {
		setProdSelectedRow(id);
	}

	const handleCleanClick = () => {
		setProdSelectedRow(0);
	}

	const handleSubmit = async () => {

		const isValid = await validitySchema.isValid({ validity: validity });
		if (!isValid) {
			setOpenSnackError(true);
			return;
		}

		if (!validity) {
			setOpenSnackError(true);
		} else {
			const result = await ValidityService.create(prodSelectedRow, validity);
			if (result instanceof Error) {
				Swal.fire({
					icon: "warning",
					title: "Validade já cadastrada",
					showConfirmButton: false,
					timer: 1000
				});
			} else {
				Swal.fire({
					icon: "success",
					title: "Validade Cadastrada!",
					showConfirmButton: false,
					timer: 1000
				});
			}
			listValidities();
			setValidity(undefined);
			if (inputDate.current) {
				inputDate.current.value = '';
			}
		}
	}

	const dateColorFinder = (validity: Date): string => {
		if (!isDate(validity)) {
			console.error('Invalid date:', validity);
			return 'textSecondary';
		}

		const currentDate = startOfDay(new Date());
		const oneWeekAhead = addDays(currentDate, 7);
		const twoWeekAhead = addDays(currentDate, 14);

		oneWeekAhead.setDate(currentDate.getDate() + 7);
		twoWeekAhead.setDate(currentDate.getDate() + 14);
		const daysUntilValidity = differenceInDays(validity, currentDate);

		if (daysUntilValidity <= 7) {
			return '#f00'; // Menos de duas semanas
		} else if (daysUntilValidity <= 14) {
			return '#ec0'; // Menos de uma semana
		} else {
			return '';
		}
	}
	const handleText = (validity: Date): string => {
		if (!isDate(validity)) {
			console.error('Invalid date:', validity);
			return 'textSecondary';
		}

		const currentDate = startOfDay(new Date());
		const daysUntilValidity = differenceInDays(validity, currentDate);


		if (daysUntilValidity == 0) {
			return '(HOJE)';
		} else if (validity < currentDate) {
			return '(VENCIDO)';
		} else {
			return '';
		}
	}

	const handleRemove = async (id: number) => {

		const response = await ValidityService.deleteById(id);

		if (response instanceof Error) {
			console.error("Ocorreu algum erro no momento da remoção da validade!");
		} else {
			Swal.fire({
				icon: "success",
				title: "Validade Removida !",
				showConfirmButton: false,
				timer: 1000,
			});
		}
		listValidities();
	}

	const handleKeyDownDate = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (e.code === 'Enter' || e.key === 'Enter') handleSubmit();
	}

	return (
		<LayoutMain title="Validades" subTitle="Adicione ou gerencie validades">
			<Grid container>
				<Grid item xs={4}>
					<Paper
						sx={{ backgroundColor: "#fff", px: 3, py: 1, mr: 5, mb: 1 }}
						variant="elevation"
					>
						<Box display={'flex'} justifyContent={'space-between'}>
							<TextField
								fullWidth
								size="small"
								autoComplete="off"
								value={prodSearch}
								placeholder={'Pesquisar'}
								onChange={(event) => { setSearchParams((old) => { old.set('prodSearch', event.target.value); old.delete('prodPage'); return old; }) }}
							/>
						</Box>
					</Paper>
					<Paper
						sx={{ backgroundColor: "#fff", px: 3, py: 1, mr: 5 }}
						variant="elevation"
					>
						<Box minHeight={500}>
							<Table>
								<TableHead>
									<TableRow>
										<TableCell width={100}>Código</TableCell>
										<TableCell>Nome</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{prodRows?.map((prod) => (
										<TableRow
											hover
											key={prod.id}
											sx={{ cursor: "pointer" }}
											selected={prodSelectedRow == prod.id}
											onClick={() => handleProdRowClick(prod.id)}
										>
											<TableCell>{prod.code}</TableCell>
											<TableCell>{prod.name}</TableCell>
										</TableRow>
									))}
								</TableBody>
								{prodTotalCount === 0 && (
									<caption>Nenhum produto encontrado</caption>
								)}
							</Table>
						</Box>
						{prodTotalCount > 0 && prodTotalCount > PRODUCT_ROW_LIMIT && (
							<Pagination
								sx={{ mt: 2 }}
								page={Number(prodPage)}
								count={Math.ceil(prodTotalCount / PRODUCT_ROW_LIMIT)}
								onChange={(_, newPage) =>
									setSearchParams((old) => {
										old.set("prodPage", newPage.toString());
										return old;
									})
								}
								disabled={loadingPageProd}
							/>
						)}


					</Paper>
				</Grid>
				<Grid item xs={8}>
					<Paper
						sx={{ backgroundColor: "#fff", px: 3, py: 1, mr: 5, mb: 1 }}
						variant="elevation"
					>
						<Box display={'flex'} justifyContent={'space-between'}>
							<Button
								variant="outlined"
								onClick={handleCleanClick}
								disabled={!prodSelectedRow}
							>
								<UndoIcon fontSize="small" sx={{ mr: 1 }} />
								Limpar Seleção
							</Button>
							<Box>
								<TextField
									size="small"
									autoComplete="off"
									inputProps={{ type: 'date' }}
									sx={{ maxWidth: 200, ml: 2 }}
									inputRef={inputDate}
									onKeyDown={handleKeyDownDate}
									onChange={(e) => {
										const dateString = e.target.value;
										if (dateString) {
											const date = new Date(dateString);
											setValidity(date);
										} else {
											setValidity(undefined);
										}
									}}
									disabled={!prodSelectedRow}
								/>
								<Button
									sx={{ minHeight: 40, ml: 2 }}
									variant="outlined"
									onClick={handleSubmit}
									disabled={!prodSelectedRow}
								>
									<AddIcon sx={{ mr: 1 }} />
									Adicionar Validade
								</Button>
							</Box>
						</Box>
					</Paper>
					<Paper
						sx={{ backgroundColor: "#fff", px: 3, py: 1, mr: 5 }}
						variant="elevation"
					>
						<Box minHeight={535}>
							<Table>
								<TableHead>
									<TableRow>
										<TableCell>Código</TableCell>
										<TableCell>Nome</TableCell>
										<TableCell>Validade</TableCell>
										<TableCell>Ações</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{valRows.map((val) => (
										<TableRow
											hover
											key={val.id}
										>
											<TableCell>{val.code}</TableCell>
											<TableCell>{val.name}</TableCell>
											<TableCell>
												<Typography variant="body1" color={dateColorFinder(new Date(val.validity))}>
													{format(val.validity, 'dd/MM/yyyy ')}{handleText(new Date(val.validity))}
												</Typography>
											</TableCell>
											<TableCell>
												<Fab
													size="medium"
													color="error"
													aria-label="remove"
													onClick={() => handleRemove(val.id)}
												>
													<RemoveIcon />
												</Fab>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
								{valTotalCount === 0 && (
									<caption>Nenhum produto encontrado</caption>
								)}
							</Table>
						</Box>
						{valTotalCount > 0 && valTotalCount > VALIDITY_ROW_LIMIT && (
							<Pagination
								sx={{ mt: 2 }}
								page={Number(ValidityPage)}
								count={Math.ceil(valTotalCount / VALIDITY_ROW_LIMIT)}
								onChange={(_, newPage) =>
									setSearchParams((old) => {
										old.set("ValidityPage", newPage.toString());
										return old;
									})
								}
								disabled={loadingPageVal}
							/>
						)}
					</Paper>
				</Grid>
			</Grid>
			{/* ------------------- ------------------- SNACK BAR FAILED ------------------- ------------------- */}
			<Snackbar
				open={openSnackError}
				autoHideDuration={2000}
				sx={{ minWidth: 500 }}
				onClose={() => setOpenSnackError(false)}
				anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
			>
				<Alert
					onClose={() => setOpenSnackError(false)}
					severity="error"
					variant="filled"
					sx={{ width: '100%' }}
				>
					Data Inválida !
				</Alert>
			</Snackbar>
		</LayoutMain>
	);
};