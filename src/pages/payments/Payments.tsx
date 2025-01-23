import {
	Box,
	Fab,
	Grid,
	Paper,
	Table,
	Alert,
	Button,
	Skeleton,
	TableRow,
	useTheme,
	TableBody,
	TableCell,
	TableHead,
	Pagination,
	Typography,
	TableContainer,
	useMediaQuery,
} from "@mui/material";
import * as yup from 'yup';
import Swal from "sweetalert2";
import { FormHandles } from "@unform/core";
import UndoIcon from '@mui/icons-material/Undo';
import { VForm } from "../../shared/forms/VForm";
import { LayoutMain } from "../../shared/layouts";
import DeleteIcon from '@mui/icons-material/Delete';
import PaymentsIcon from '@mui/icons-material/Payments';
import { Link, useSearchParams } from "react-router-dom";
import { nToBRL } from "../../shared/services/formatters";
import { VTextField } from "../../shared/forms/VTextField";
import { useEffect, useMemo, useRef, useState } from "react";
import { differenceInDays, format, startOfDay } from 'date-fns';
import { IMenuItens, VSelect } from "../../shared/forms/VSelect";
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { OrderByPayment } from "../../shared/services/api/PaymentService";
import { CustomSelect } from "../../shared/forms/customInputs/CustomSelect";
import { CustomCheckbox } from "../../shared/forms/customInputs/CustomCheckbox";
import { IPaymentResponse, PaymentService, SupplierService } from "../../shared/services/api";


const ROW_LIMIT = 6;
const NUMBER_OF_SKELETONS = Array(ROW_LIMIT).fill(null);


export const Payments: React.FC = () => {
	const theme = useTheme();
	const smDown = useMediaQuery(theme.breakpoints.down('sm'));
	const formRef = useRef<FormHandles>(null);

	const [suppliers, setSuppliers] = useState<IMenuItens[]>([]);
	const [searchParams, setSearchParams] = useSearchParams();
	const [loading, setLoading] = useState(true);
	const [totalCount, setTotalCount] = useState(0);
	const [loadingPage, setLoadingPage] = useState(false);
	const [fetchError, setFetchError] = useState(false);
	const [orderBy, setOrderBy] = useState<OrderByPayment>({ column: 'expiration', order: 'asc', show: { EXPIRED: true } });
	const [loadingSubmit, setLoadingSubmit] = useState(false);
	const [rows, setRows] = useState<IPaymentResponse[]>([]);

	const PaymentValidation = yup.object().shape({
		code: yup.string().required().min(47).max(47),
		supplier_id: yup.number().required().min(0),
		desc: yup.string(),
	});

	const page = useMemo(() => {
		return searchParams.get('page') || 1;
	}, [searchParams]);

	useEffect(() => {
		const fetchSup = async () => {
			if (suppliers.length <= 0) {
				const result = await SupplierService.getAll(undefined, undefined, 99999)
				if (result instanceof Error) {
					alert('Erro ao buscar Fornecedores');
				} else {
					result.data.map((data) => {
						const object = { text: data.name, value: `${data.id}` }
						setSuppliers((old) => [...old, object]);
					})
				}
			}
		}
		fetchSup();
	}, []);

	useEffect(() => {
		listPayments();
	}, [page, orderBy]);

	const listPayments = async () => {
		setLoading(true);
		setLoadingPage(true);
		const result = await PaymentService.getAll(Number(page), ROW_LIMIT, orderBy);
		if (result instanceof Error) {
			alert(result.message);
		} else {
			setTotalCount(result.totalCount);
			setRows(result.data);
		}
		setLoading(false);
		setLoadingPage(false);
	}

	const handleOrderByChange = (value: string, type: 'order' | 'fornecedor') => {
		if (type === 'order') {
			if (value === 'expiration') {
				setOrderBy((old) => ({ ...old, column: 'expiration', order: 'asc' }));
			} else {
				setOrderBy((old) => ({ ...old, column: 'created_at', order: 'desc' }));
			}
		} else {
			if (value === ' ') {
				setOrderBy((old) => ({ ...old, supplier_id: undefined }));
			} else {
				setOrderBy((old) => ({ ...old, supplier_id: Number(value) }));
			}
		}
		setSearchParams({ page: '1' }, { replace: true });
	}

	const getColorByDate = (date: Date) => {
		const today = startOfDay(new Date());
		const expiration = startOfDay(date);

		const diference = differenceInDays(today, expiration);

		if (diference == 0) return '#fb0';
		else if (expiration < today) return '#f00';
		else return 'textSecondary';
	}

	const handleRemove = async (id: number) => {
		let timerInterval: number;

		Swal.fire({
			title: 'Tem Certeza?',
			icon: 'warning',
			iconColor: theme.palette.error.main,
			showCancelButton: true,
			confirmButtonColor: theme.palette.error.main,
			cancelButtonColor: '#aaa',
			cancelButtonText: 'Cancelar',
			confirmButtonText: 'Apagar',
			didOpen: () => {
				const confirmButton = Swal.getConfirmButton();
				if (confirmButton) {
					confirmButton.disabled = true; // Desabilita o botão inicialmente

					let timeLeft = 3;
					confirmButton.textContent = `Apagar (${timeLeft})`;

					// Timer de 5 segundos
					timerInterval = window.setInterval(() => {
						timeLeft--;
						confirmButton.textContent = `Apagar (${timeLeft})`;

						if (timeLeft === 0) {
							clearInterval(timerInterval);
							confirmButton.textContent = 'Apagar';
							confirmButton.disabled = false; // Habilita o botão após o timer
						}
					}, 1000);
				}
			},
			willClose: () => {
				clearInterval(timerInterval); // Limpa o intervalo quando o modal fechar
			}

		}).then(async (result) => {
			if (result.isConfirmed) {
				const response = await PaymentService.deleteById(id);

				if (response instanceof Error) {
					console.error("Ocorreu algum erro no momento da remoção do boleto!");
				} else {
					Swal.fire({
						icon: "success",
						title: "Boleto Removido !",
						showConfirmButton: false,
						timer: 1000,
					});
				}
				listPayments();
			}
		});
	}

	const handlePay = async (id: number) => {
		const response = await PaymentService.markWithPaid(id);

		if (response instanceof Error) {
			console.error("Ocorreu algum erro no momento da atualização do cadastro!");
		} else {
			Swal.fire({
				icon: "success",
				title: "Boleto marcado como pago !",
				showConfirmButton: false,
				timer: 1000,
			});
		}
		listPayments();
	}

	const handlePayRollback = async (id: number) => {
		const response = await PaymentService.unmarkWithPaid(id);
		if (response instanceof Error) console.error("Ocorreu algum erro no momento da atualização do cadastro!");
		listPayments();
	}

	const handleSubmit = async (data: { supplier_id: number, desc?: string, code: string }) => {
		try {
			setLoadingSubmit(true);

			await PaymentValidation.validate(data, { abortEarly: false })

			const result = await PaymentService.create(data);

			if (result instanceof Error) {
				setFetchError(true);
			} else {
				Swal.fire({
					icon: "success",
					title: "Sucesso",
					text: "Boleto cadastrado com sucesso!",
					showConfirmButton: true,
				});
				formRef.current?.setFieldValue('supplier_id', 0);
				formRef.current?.setFieldValue('code', '');
				formRef.current?.setFieldValue('desc', '');
				listPayments();
			}
		} catch (errors) {
			if (errors instanceof yup.ValidationError) {
				const validatenErrors: { [key: string]: string } = {};
				errors.inner.forEach((e) => {
					if (!e.path) return;
					validatenErrors[e.path] = e.message;
				});

				formRef.current?.setErrors(validatenErrors)
				return;
			}
		} finally {
			setLoadingSubmit(false);
		}
	}

	return (
		<LayoutMain title="Boletos" subTitle="Gerencie seus boletos">
			<Grid container spacing={smDown ? 1 : 2}>
				<Grid item xs={smDown ? 12 : 7}>
					<Paper variant="elevation" sx={{ backgroundColor: '#fff', mr: 4, px: 3, py: 1, mt: 1, width: 'auto' }}>
						<Box display={'flex'} justifyContent={'space-between'} flexDirection={smDown ? 'column' : 'row'}>
							<Typography variant="h5" sx={{ m: 2 }}>Boletos:</Typography>
							<Box display={'flex'} gap={smDown ? 1 : 2} margin={2} alignItems={'center'} flexDirection={smDown ? 'column' : 'row'}>
								<CustomCheckbox
									menuItens={
										[
											{ id: '1', label: 'Mostrar Pagos', defaultChecked: false },
											{ id: '2', label: 'Ocultar Vencidos', defaultChecked: false },
										]
									}
									disabled={loading}
									onValueChange={e => {
										setOrderBy((old) => ({ ...old, show: { PAID: e.includes('1'), EXPIRED: !e.includes('2') } }));
										setSearchParams({ page: '1' }, { replace: true });
									}}
									flexDirection='column'
								/>
								<Box display={'flex'} gap={2} margin={2} flexDirection={smDown ? 'column' : 'row'}>
									<CustomSelect
										label="Ordenar por"
										menuItens={[{ text: 'Vencimento', value: 'expiration' }, { text: 'Data', value: 'created_at' }]}
										defaultSelected={0}
										onValueChange={(e) => handleOrderByChange(e, 'order')}
										minWidth={200}
									/>
									<CustomSelect
										label="Fornecedor"
										menuItens={[{ text: 'Todos', value: ' ' }, ...suppliers]}
										defaultSelected={0}
										onValueChange={(e) => handleOrderByChange(e, 'fornecedor')}
										minWidth={200}
									/>
								</Box>
							</Box>
						</Box>
						<Box minHeight={550}>
							<TableContainer>
								<Table>
									<TableHead>
										<TableRow>
											{!smDown && <TableCell>Data</TableCell>}
											{!smDown && <TableCell>Fornecedor</TableCell>}
											<TableCell>Valor</TableCell>
											<TableCell>Vencimento</TableCell>
											<TableCell>Ações</TableCell>
											<TableCell>Marcar Pago</TableCell>
										</TableRow>
									</TableHead>

									<TableBody>
										{
											!loading ? rows.map(
												(row) => {
													return (
														<TableRow
															key={row.id}
															sx={
																row.paid &&
																{ backgroundColor: '#38f75522' }
															}
														>
															{!smDown &&
																<TableCell>
																	<Typography>
																		{format(row.created_at, 'dd/MM')}
																	</Typography>
																</TableCell>
															}
															{!smDown &&
																<TableCell>
																	<Typography>
																		{row.name}
																	</Typography>
																</TableCell>
															}
															<TableCell>
																<Typography>
																	{nToBRL(row.value)}
																</Typography>
															</TableCell>
															<TableCell>
																<Typography color={getColorByDate(row.expiration)}>
																	{format(row.expiration, 'dd/MM/yyyy')}
																</Typography>
															</TableCell>
															<TableCell>
																<Link to={'/boleto/' + row.id + '?backPage=' + page}>
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
																</Link>
																<Fab
																	size="medium"
																	color="info"
																	onClick={() => handleRemove(row.id)}
																	sx={{
																		backgroundColor: '#bb0000',
																		ml: 2,
																		'&:hover': { backgroundColor: '#f00000' },
																	}}
																>
																	<DeleteIcon color="info" />
																</Fab>
															</TableCell>
															<TableCell>
																{
																	!row.paid ?
																		<Fab
																			size="medium"
																			color="success"
																			onClick={() => handlePay(row.id)}
																			sx={{
																				backgroundColor: '#28a745',
																				'&:hover': { backgroundColor: '#38b755' },
																			}}
																		>
																			<PaymentsIcon color="info" />
																		</Fab>
																		:
																		<Fab
																			size="medium"
																			color="success"
																			onClick={() => handlePayRollback(row.id)}
																			sx={{
																				backgroundColor: '#28a745',
																				'&:hover': { backgroundColor: '#38b755' },
																			}}
																		>
																			<UndoIcon color="info" />
																		</Fab>
																}
															</TableCell>
														</TableRow>
													);
												}
											)
												:
												NUMBER_OF_SKELETONS.map((_, index) => (
													<TableRow key={index}>
														<TableCell >
															<Skeleton sx={{ minHeight: 40, maxWidth: 160 }} />
														</TableCell>
														<TableCell >
															<Skeleton sx={{ minHeight: 40, maxWidth: 50 }} />
														</TableCell>
														<TableCell >
															<Skeleton sx={{ minHeight: 40, maxWidth: 80 }} />
														</TableCell>
														<TableCell >
															<Fab disabled size='medium' sx={{ mr: 2 }}></Fab>
															<Fab disabled size='medium' sx={{ mr: 2 }}></Fab>
															<Fab disabled size='medium'></Fab>
														</TableCell>
													</TableRow>
												))
										}
									</TableBody>
									{totalCount === 0 && !loading && (
										<caption>Nenhuma Registro Encontrado</caption>
									)}
								</Table>
							</TableContainer>
						</Box>
						{totalCount > 0 && (
							<Pagination
								sx={{ m: 1 }}
								disabled={loadingPage}
								page={Number(page)}
								count={Math.ceil(totalCount / ROW_LIMIT)}
								onChange={(_, newPage) => setSearchParams({ page: newPage.toString() }, { replace: true })}
								siblingCount={0}
							/>
						)}
					</Paper>
				</Grid>
				{!smDown &&
					<Grid item xs={5}>
						<Paper variant="elevation" sx={{ backgroundColor: '#fff', mr: 4, px: 3, py: 1, mt: 1, width: 'auto' }}>
							<Typography variant="h5" sx={{ m: 2 }}>Novo Boleto:</Typography>
							{(fetchError && <Alert severity="error">Já existe um boleto com este código !</Alert>)}
							<VForm ref={formRef} onSubmit={handleSubmit} placeholder={''}>
								<Box display={'flex'} flexDirection={'column'} gap={3} margin={3}>
									<Box display={'flex'} gap={5}>
										<Box width={300}>
											<VSelect
												name="supplier_id"
												label="Fornecedor"
												menuItens={suppliers.length > 0 ? suppliers : [{ text: "Nenhum fornecedor cadastrado", value: "" }]}
												messageError="Fornecedor não pode ser vazio"
											/>
										</Box>
									</Box>
									<VTextField name="code" label="Código" autoComplete="off" onKeyDown={() => setFetchError(false)} />
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
				}
			</Grid>
		</LayoutMain >
	);
};