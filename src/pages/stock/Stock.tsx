import {
	Box,
	Fab,
	Icon,
	Paper,
	Table,
	Alert,
	Button,
	Dialog,
	Switch,
	Skeleton,
	TableRow,
	Snackbar,
	TableBody,
	TableCell,
	TextField,
	FormGroup,
	TableHead,
	Typography,
	Pagination,
	DialogTitle,
	Autocomplete,
	DialogContent,
	DialogActions,
	FormControlLabel,
	DialogContentText,
	useTheme,
	useMediaQuery,
} from "@mui/material";
import * as yup from 'yup';
import Swal from 'sweetalert2';
import AddIcon from '@mui/icons-material/Add';
import { useDebounce } from "../../shared/hooks";
import { LayoutMain } from "../../shared/layouts";
import { useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { CustomSelect } from '../../shared/forms/customInputs/CustomSelect';
import { IProductWithStock, ProductService, StockService, ValidityService } from "../../shared/services/api";

const STOCK_ROW_LIMIT = 7;
const NUMBER_OF_SKELETONS = Array(7).fill(null);

const validitySchema = yup.object().shape({
	validity: yup.date().required()
});


export const Stock: React.FC = () => {
	const theme = useTheme();
	const smDown = useMediaQuery(theme.breakpoints.down('sm'));

	const [searchParams, setSearchParams] = useSearchParams();
	const { debounce } = useDebounce();

	const inputDate = useRef<HTMLInputElement>();
	const inputQnt = useRef<HTMLInputElement>();



	const [open, setOpen] = useState(false);
	const [editMode, setEditMode] = useState(0);
	const [qntStock, setQntStock] = useState(0);
	const [loading, setLoading] = useState(true);
	const [editStock, setEditStock] = useState(0);
	const [errorQnt, setErrorQnt] = useState(false);
	const [totalCount, setTotalCount] = useState(0);
	const [errorDate, setErrorDate] = useState(false);
	const [openSnack, setOpenSnack] = useState(false);
	const [selectedProd, setSelectedProd] = useState(0);
	const [loadingPage, setLoadingPage] = useState(true);
	const [orderBy, setOrderBy] = useState('updated_at');
	const [editLoading, setEditLoading] = useState(false);
	const [errorSelect, setErrorSelect] = useState(false);
	const [validityDate, setValidityDate] = useState<Date>();
	const [rows, setRows] = useState<IProductWithStock[]>([]);
	const [openSnackError, setOpenSnackError] = useState(false);
	const [selectedProdName, setSelectedProdName] = useState('');
	const [switchActivated, setSwitchActivated] = useState(false);
	const [allProducts, setAllProducts] = useState<{ label: string, id: number }[]>();

	const stockPage = useMemo(() => {
		return searchParams.get('stockPage') || 1;
	}, [searchParams]);

	const stockSearch = useMemo(() => {
		return searchParams.get('stockSearch') || '';
	}, [searchParams]);

	useEffect(() => {
		debounce(() => {
			listStocks();
		})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [stockPage, stockSearch, orderBy]);

	const handleClickOpen = () => {
		setOpen(true);
		getAllProducts();
	};

	const openAdd = (id: number, name: string) => {
		setOpen(true);
		getAllProducts();
		setSelectedProd(id);
		setSelectedProdName(name);
	}

	const handleClose = () => {
		setOpen(false);
		setQntStock(0);
		setSelectedProd(0);
		setErrorQnt(false);
		setErrorDate(false);
		setErrorSelect(false);
		setSelectedProdName('');
		setSwitchActivated(false);
	};

	const getAllProducts = async () => {
		const response = await ProductService.getAll(1, 999999999);
		if (response instanceof Error) {
			alert('ocorreu algum erro')
		}
		else {
			const dataFilter = response.data.map((prod) => { return { label: prod.name, id: prod.id } });
			setAllProducts(dataFilter);
		}
	}

	const listStocks = async () => {
		try {
			setLoadingPage(true);
			setLoading(true);
			const response = await StockService.getAll(Number(stockPage), STOCK_ROW_LIMIT, stockSearch, orderBy);
			if (response instanceof Error) {
				alert("Ocorreu algum erro");
			} else {
				setRows(response.data);
				setTotalCount(response.totalCount);
			}
		} catch (e) {
			console.error(e);
		} finally {
			debounce(() => {
				setLoading(false);
			});
			setLoadingPage(false);
		}
	}

	const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSwitchActivated(e.target.checked);
		if (!e.target.checked) {
			setValidityDate(undefined);
			setErrorDate(false);
		}
	}

	const handleSubmit = async () => {
		if (!selectedProd) {
			setErrorSelect(true);
			return;
		}
		if (qntStock < 1) {
			setErrorQnt(true);
			return;
		}
		if (switchActivated) {
			const isValid = await validitySchema.isValid({ validity: validityDate });
			if (!isValid) {
				setErrorDate(true);
				return;
			}
		}

		Swal.fire({
			title: 'Adicionar Estoque?',
			text: `Adicionar ${qntStock} de "${selectedProdName}" ?`,
			icon: 'warning',
			confirmButtonText: 'Adicionar',
			confirmButtonColor: '#090'
		}).then(async (result) => {
			if (result.isConfirmed) {
				const response = await StockService.create(selectedProd, qntStock);
				if (response instanceof Error) {
					alert("Ocorreu um erro")
				} else {
					Swal.fire({
						icon: "success",
						title: "Estoque Adicionado!",
						showConfirmButton: false,
						timer: 1000
					});

					// ESSA PARTE NAO FUNCIONOU:
					setQntStock(0);
					setSelectedProd(0);
					setErrorQnt(false);
					setErrorDate(false);
					setErrorSelect(false);
					setSelectedProdName('');
					if (inputDate.current) {
						inputDate.current.value = '';
					}
					if (inputQnt.current) {
						inputQnt.current.value = '';
					}
				}
				listStocks();
				if (switchActivated) {
					if (!validityDate) {
						setErrorDate(true);
					} else {
						const result = await ValidityService.create(selectedProd, validityDate);
						if (result instanceof Error) {
							setOpenSnackError(true);
						} else {
							setOpenSnack(true);
						}
						setValidityDate(undefined);
					}
				}
			}
		});

	}

	const submitEdit = async () => {
		setTimeout(async () => {
			setEditLoading(true);
			const res = await Swal.fire({
				title: 'Tem Certeza?',
				text: ``,
				icon: 'warning',
				// iconColor: theme.palette.error.main,
				showCancelButton: true,
				// confirmButtonColor: theme.palette.error.main,
				cancelButtonColor: '#aaa',
				cancelButtonText: 'Cancelar',
				confirmButtonText: 'Editar'
			});

			if (res.isConfirmed) {
				const result = await StockService.updateById(editMode, editStock);
				if (result instanceof Error) {
					Swal.fire({
						icon: "error",
						title: "Erro ao editar estoque!",
						showConfirmButton: true
					});
				} else {
					setEditMode(0);
					listStocks();
					Swal.fire({
						icon: "success",
						title: "Estoque editado com sucesso!",
						showConfirmButton: true,
						timer: 1000
					});
				}
			}
			setEditLoading(false);
		}, 50);
	}

	return (
		<LayoutMain title="Estoque" subTitle="Adicione ou gerencie o estoque">
			<Paper
				sx={{ backgroundColor: "#fff", px: 3, py: 1, mr: 5, mb: 1 }}
				variant="elevation"
			>
				<Box display={'flex'} justifyContent={'space-between'} flexDirection={smDown ? 'column' : 'row'}>
					<Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} gap={smDown ? 2 : 10} flexDirection={smDown ? 'column' : 'row'} mb={smDown ? 2 : undefined}>
						<TextField
							size="small"
							placeholder={'Pesquisar'}
							value={stockSearch}
							onChange={(event) => { setSearchParams((old) => { old.set('stockSearch', event.target.value); old.delete('stockPage'); return old; }) }}
							autoComplete="off"
						/>
						<Box display={'flex'} alignItems={'center'}>
							<Typography mr={3}>
								Ordenar Por:
							</Typography>
							<CustomSelect
								size="small"
								menuItens={[{ text: 'Ultima atualização', value: 'updated_at' }, { text: 'Estoque', value: 'stock' }]}
								onValueChange={(e) => setOrderBy(e)}
								minWidth={200}
								defaultSelected={0}
							/>
						</Box>
					</Box>
					<Button variant="contained" onClick={handleClickOpen}><AddIcon sx={{ mr: 1 }} />Adicionar</Button>
				</Box>
			</Paper>
			<Paper
				sx={{ backgroundColor: "#fff", px: 3, py: 3, mr: 5, mb: 1 }}
				variant="elevation"
			>
				<Box minHeight={440} m={1}>
					<Table>
						<TableHead>
							<TableRow>
								{!smDown && <TableCell width={200}>Código</TableCell>}
								<TableCell>Produto</TableCell>
								<TableCell>Estoque</TableCell>
								<TableCell>Ações</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{
								!loading &&
								rows.map(
									(row) => (
										<TableRow
											key={row.code}
											hover
										>
											{!smDown && <TableCell>{row.code}</TableCell>}
											<TableCell>{row.name}</TableCell>
											<TableCell>
												{
													row.id == editMode ?
														<Box maxWidth={80}>
															<TextField
																autoFocus
																name='stock'
																label={'Estoque'}
																autoComplete="off"
																value={editStock}
																inputProps={{ type: 'number' }}
																onChange={(e) => setEditStock(Number(e.target.value))}
																onKeyDown={(e) => {
																	if (e.code === 'Enter' || e.key === 'Enter') submitEdit();
																}}
															/>
														</Box>
														:
														row.stock
												}
											</TableCell>
											<TableCell>
												{
													row.id == editMode ?
														<Box>
															<Fab size="medium" color="error" sx={{ mr: 2 }} onClick={() => setEditMode(0)}>
																<Icon>close</Icon>
															</Fab>
															<Fab size="medium" color="success" disabled={editLoading} onClick={submitEdit}>
																<Icon>check</Icon>
															</Fab>
														</Box>
														:
														<Box>

															<Fab size="medium" color="warning" sx={{ mr: 2 }} onClick={() => { setEditStock(row.stock); setEditMode(row.id); }}>
																<Icon>edit</Icon>
															</Fab>
															<Fab size="medium" color="primary" onClick={() => openAdd(row.prod_id, row.name)}>
																<Icon>add</Icon>
															</Fab>
														</Box>
												}
											</TableCell>
										</TableRow>
									)
								)
							}
							{
								loading &&
								NUMBER_OF_SKELETONS.map(
									(_, index) => (
										<TableRow key={index}>
											<TableCell >
												<Skeleton sx={{ maxWidth: 100 }} />
											</TableCell>
											<TableCell >
												<Skeleton sx={{ maxWidth: 150 }} />
											</TableCell>
											<TableCell >
												<Skeleton sx={{ maxWidth: 50 }} />
											</TableCell>
										</TableRow>
									)
								)
							}

						</TableBody>
						{totalCount === 0 && !loading && (
							<caption>Nenhum grupo encontrado</caption>
						)}
					</Table>
				</Box>
				{totalCount > 0 && totalCount > STOCK_ROW_LIMIT && (
					<Pagination
						disabled={loadingPage}
						page={Number(stockPage)}
						count={Math.ceil(totalCount / STOCK_ROW_LIMIT)}
						onChange={(_, newPage) =>
							setSearchParams((old) => {
								old.set("stockPage", newPage.toString());
								return old;
							})
						}
					/>
				)}
			</Paper>

			{/* ------------------- ------------------- ADD MODAL ------------------- ------------------- */}
			<Dialog
				open={open}
				onClose={handleClose}
				fullWidth
				sx={{
					"& .MuiDialog-paper":
						{ backgroundColor: "#fff", }
				}}>
				<DialogTitle>Adicionar</DialogTitle>
				<DialogContent>
					{errorSelect && (<Alert severity='error' sx={{ mb: 1 }}>Escolha um produto</Alert>)}
					{errorQnt && (<Alert severity='warning' sx={{ mb: 1 }}>Quantidade precisa ser maior que 0</Alert>)}
					{errorDate && (<Alert severity='warning' sx={{ mb: 1 }}>Data inválida</Alert>)}
					<DialogContentText mb={4}>
						Cadastrar estoque
					</DialogContentText>
					<Box minHeight={80} display={'flex'} gap={6}>
						<Autocomplete
							id="combo-box"
							value={{ label: selectedProdName, id: selectedProd }}
							options={allProducts ?? []}
							sx={{ width: 300 }}
							renderOption={(props, option) => {
								return (
									<li {...props} key={option.id}>
										{option.label}
									</li>
								);
							}}
							renderInput={(params) => <TextField {...params} label="Produto" />}
							onChange={(_, newValue) => {
								if (newValue) {
									setSelectedProd(newValue.id);
									setSelectedProdName(newValue.label);
								} else { setSelectedProd(0); setSelectedProdName(''); }

								setErrorSelect(false);
							}}
						/>
						<TextField
							autoComplete="off"
							label={'Quantidade'}
							sx={{ maxWidth: 120 }}
							inputProps={{ type: 'number' }}
							onChange={(e) => { setQntStock(Number(e.target.value)); setErrorQnt(false); }}
							onFocus={() => setErrorQnt(false)}
							inputRef={inputQnt}
						/>
					</Box>
					<FormGroup sx={{ mb: 2 }}>
						<FormControlLabel control={<Switch checked={switchActivated} onChange={handleSwitch} />} label="Adicionar Validade" sx={{ ml: 2 }} />
					</FormGroup>
					{switchActivated && (
						<TextField
							autoComplete="off"
							inputProps={{ type: 'date' }}
							// value={validityDate}
							onChange={(e) => {
								const dateString = e.target.value;
								if (dateString) {
									const date = new Date(dateString);
									setValidityDate(date);
								} else {
									setValidityDate(undefined);
								}
								setErrorDate(false);
							}}
							onFocus={() => setErrorDate(false)}
							inputRef={inputDate}
						/>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} variant='outlined'>Cancelar</Button>
					<Button onClick={handleSubmit} variant='contained'>Cadastrar</Button>
				</DialogActions>
			</Dialog>
			{/* ------------------- ------------------- SNACK BAR SUCCESS ------------------- ------------------- */}
			<Snackbar
				open={openSnack}
				autoHideDuration={3000}
				onClose={() => setOpenSnack(false)}
				anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
				sx={{ height: 200, width: 600, zIndex: 999999999 }}
			>
				<Alert
					onClose={() => setOpenSnack(false)}
					severity="success"
					variant="filled"
					sx={{ width: '100%' }}
				>
					Validade cadastrada !
				</Alert>
			</Snackbar>
			{/* ------------------- ------------------- SNACK BAR FAILED ------------------- ------------------- */}
			<Snackbar
				open={openSnackError}
				autoHideDuration={3000}
				onClose={() => setOpenSnackError(false)}
				anchorOrigin={{ vertical: 'top', horizontal: 'right' }}

			>
				<Alert
					onClose={() => setOpenSnackError(false)}
					severity="error"
					variant="filled"
					sx={{ width: '100%' }}
				>
					Erro ao cadastrar validade !
				</Alert>
			</Snackbar>
		</LayoutMain>
	);
};