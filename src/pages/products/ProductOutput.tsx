import { Autocomplete, Box, Button, Dialog, DialogContent, Grid, Pagination, Paper, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { LayoutMain } from '../../shared/layouts';
import { VForm } from '../../shared/forms/VForm';
import { VSelect } from '../../shared/forms/VSelect';
import { VTextField } from '../../shared/forms/VTextField';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FormHandles } from '@unform/core';
import { FincashService, IOutputQuery, ProductService } from '../../shared/services/api';
import { format } from 'date-fns';
// import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';

import { EProdOutReason } from '../outflow/enum/EProdOutReason';
import Swal from 'sweetalert2';
import { useSearchParams } from 'react-router-dom';

const OUTFLOW_ROW_LIMIT = 9;
const NUMBER_OF_SKELETONS = Array(OUTFLOW_ROW_LIMIT).fill(null);

interface IFormData {
	quantity: number,
	reason: EProdOutReason,
	desc: string,
}

export const ProductOutput: React.FC = () => {
	const [allProducts, setAllProducts] = useState<{ label: string, id: number }[]>();
	const [searchParams, setSearchParams] = useSearchParams();

	const [selectedProd, setSelectedProd] = useState(0);
	const [selectedProdName, setSelectedProdName] = useState('');

	const [ACError, setACError] = useState(false);
	const [qntError, setQntError] = useState(false);
	const [reasonError, setReasonError] = useState(false);

	const [loadingSubmit, setLoadingSubmit] = useState(false);
	const [loadingPage, setLoadingPage] = useState(true);
	const [loading, setLoading] = useState(true);

	const [totalCount, setTotalCount] = useState(0);
	const [rows, setRows] = useState<IOutputQuery[]>([]);

	const [open, setOpen] = useState(0);


	const page = useMemo(() => {
		return searchParams.get('page') || 1;
	}, [searchParams]);

	const reasons = [
		{ text: 'Consumo', value: EProdOutReason.Consumo },
		{ text: 'Vencido', value: EProdOutReason.Vencimento },
		{ text: 'Impróprio p/ Consumo', value: EProdOutReason.Improprio },
		{ text: 'Outro', value: EProdOutReason.Outro }
	];

	useEffect(() => {
		listOutputs();
	}, [page]);

	const listOutputs = async () => {
		setLoading(true);
		setLoadingPage(true);
		const result = await ProductService.getAllOutputs(Number(page), OUTFLOW_ROW_LIMIT);
		if (result instanceof Error) {
			alert(result.message);
		} else {
			setTotalCount(result.totalCount);
			setRows(result.data);
		}
		setLoading(false);
		setLoadingPage(false);

	};

	const handleSubmit = async (data: IFormData) => {
		try {
			setLoadingSubmit(true);
			if (!selectedProd) {
				setACError(true);
				return;
			}
			if (data.quantity < 1) {
				setQntError(true);
				return;
			}
			if (!data.reason) {
				setReasonError(true);
				return;
			}
			let fincash_id: number | undefined = undefined;
			const fincash = await FincashService.getOpenFincash();
			if (!(fincash instanceof Error)) {
				fincash_id = fincash.id;
			}
			const output = {
				prod_id: selectedProd,
				quantity: data.quantity,
				reason: data.reason,
				desc: data.desc,
				fincash_id
			}
			const result = await ProductService.prodOutput(output);
			if (result instanceof Error) {
				Swal.fire({
					icon: "error",
					title: "Erro!",
					text: "Estoque não cadaastrado",
					showConfirmButton: true,
				});
			} else {
				Swal.fire({
					icon: "success",
					title: "Sucesso",
					text: "Saída cadastrada com sucesso!",
					showConfirmButton: true,
				});
				formRef.current?.setFieldValue('reason', '');
				formRef.current?.setFieldValue('quantity', '');
				formRef.current?.setFieldValue('desc', '');
				setSelectedProd(0);
				setSelectedProdName('');
				listOutputs();
			}
		} catch (e) {
			console.error(e);
		} finally {
			setLoadingSubmit(false);
		}
	}

	const formRef = useRef<FormHandles>(null);
	useEffect(() => {
		getAllProducts();
	}, [])
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

	return (
		<LayoutMain title="Saidas" subTitle="Adicione saídas ao estoque">
			<Grid container spacing={2}>
				<Grid item xs={7}>
					<Paper variant="elevation" sx={{ backgroundColor: '#fff', mr: 4, px: 3, py: 1, mt: 1, width: 'auto' }}>
						<Typography variant="h5" sx={{ m: 2 }}>Saídas:</Typography>
						<Box minHeight={550}>
							<TableContainer>
								<Table>
									<TableHead>
										<TableRow>
											<TableCell>Data</TableCell>
											<TableCell>Produto</TableCell>
											<TableCell>Quantidade</TableCell>
											<TableCell>Motivo</TableCell>
											<TableCell>Descrição</TableCell>
										</TableRow>
									</TableHead>

									<TableBody>
										{
											!loading ? rows.map(
												(row, index) => {
													return (
														<TableRow key={index}>
															<TableCell >
																{format(row.created_at, 'dd / MM')}
															</TableCell>
															<TableCell >
																{row.prod_name}
															</TableCell>
															<TableCell>{row.quantity}</TableCell>
															<TableCell>{row.reason}</TableCell>
															{/* <Link to={'/saida/produto/' + row.output_id + '?backPage=' + page}>
																<Fab
																size="medium"
																color="info"
																sx={{
																	backgroundColor: '#5bc0de',
																	'&:hover': { backgroundColor: '#6fd8ef' },
																	}}
																	>
																	<VisibilityRoundedIcon color="info" />
																	</Fab>
																	</Link> */}
															<TableCell
																sx={{ maxWidth: 200, cursor: row.desc ? 'pointer' : 'default' }}
																onClick={() => row.desc && setOpen(row.output_id)}
															>
																<Typography noWrap overflow="hidden" textOverflow="ellipsis" marginRight={1}>
																	{row.desc}
																</Typography>
															</TableCell>
															<Dialog
																open={open == row.output_id}
																onClose={() => setOpen(0)}
																maxWidth={'lg'}
																sx={{
																	"& .MuiDialog-paper":
																		{ backgroundColor: "#fff", }
																}}
															>
																<DialogContent sx={{ minHeight: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
																	<Typography>{row.desc}</Typography>
																</DialogContent>
															</Dialog>
														</TableRow>
													);
												}
											)
												:
												NUMBER_OF_SKELETONS.map((_, index) => (
													<TableRow key={index}>
														<TableCell >
															<Skeleton sx={{ minHeight: 25, maxWidth: 70 }} />
														</TableCell>
														<TableCell >
															<Skeleton sx={{ minHeight: 25, maxWidth: 120 }} />
														</TableCell>
														<TableCell >
															<Skeleton sx={{ minHeight: 25, maxWidth: 40 }} />
														</TableCell>
														<TableCell >
															<Skeleton sx={{ minHeight: 25, maxWidth: 100 }} />
														</TableCell>
														<TableCell width={220}>
															<Skeleton sx={{ minHeight: 25, maxWidth: 100 }} />
														</TableCell>
													</TableRow>
												))
										}
									</TableBody>
									{totalCount === 0 && !loading && (
										<caption>Nenhuma saída registrada</caption>
									)}
								</Table>
							</TableContainer>
						</Box>
						{totalCount > 0 && (
							<Pagination
								sx={{ m: 1, mt: 2 }}
								disabled={loadingPage}
								page={Number(page)}
								count={Math.ceil(totalCount / OUTFLOW_ROW_LIMIT)}
								onChange={(_, newPage) => setSearchParams({ page: newPage.toString() }, { replace: true })}
								siblingCount={0}
							/>
						)}
					</Paper>
				</Grid>
				<Grid item xs={5}>
					<Paper variant="elevation" sx={{ backgroundColor: '#fff', mr: 4, px: 3, py: 1, mt: 1, width: 'auto' }}>
						<Typography variant="h5" sx={{ m: 2 }}>Nova Saída:</Typography>
						<VForm ref={formRef} onSubmit={handleSubmit} placeholder={''}>
							<Box display={'flex'} flexDirection={'column'} gap={3} margin={3}>
								<Box display={'flex'} gap={5}>
									<Box width={200}>
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

												setACError(false);
											}}
										/>
										{ACError && (<Typography variant='body2' ml={2} mt={0.5} color={'#ee0000'}>Selecione um produto.</Typography>)}
									</Box>
								</Box>
								<Box>
									<VTextField
										label={'Quantidade'}
										onChange={() => {
											setQntError(false);
										}}
										name="quantity"
										sx={{ maxWidth: 120 }}
										inputProps={{ type: 'number' }}
										autoComplete="off"
									/>
									{qntError && (<Typography variant='body2' ml={1} mt={0.5} color={'#ee0000'}>Quantidade precisa ser maior que 0.</Typography>)}
								</Box>
								<Box width={220}>
									<VSelect label='Motivo' name='reason' menuItens={reasons} onValueChange={() => { setReasonError(false); }} />
									{reasonError && (<Typography variant='body2' ml={1} mt={0.5} color={'#ee0000'}>Escolha um motivo.</Typography>)}
								</Box>
								<VTextField
									name="desc"
									rows={4}
									fullWidth
									multiline
									label="Descrição"
									id="elevation-multiline-static"
									autoComplete="off"
								/>
								<Button
									variant="contained"
									onClick={() => formRef.current?.submitForm()}
									disabled={loadingSubmit}
								>
									Confirmar
								</Button>
							</Box>
						</VForm>
					</Paper>
				</Grid>
			</Grid>
		</LayoutMain >
	)
};