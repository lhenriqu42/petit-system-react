import {
	Box,
	Fab,
	Paper,
	Table,
	Button,
	Skeleton,
	useTheme,
	TableRow,
	TableCell,
	TableBody,
	TableHead,
	Pagination,
	Typography,
	useMediaQuery,
	TableContainer,
} from "@mui/material";
import Swal from "sweetalert2";
import { format } from 'date-fns';
import { LayoutMain } from "../../shared/layouts";
import BlockIcon from '@mui/icons-material/Block';
import { useEffect, useMemo, useState } from "react";
import { Environment } from "../../shared/environment";
import { nToBRL } from "../../shared/services/formatters";
import ReplyAllRoundedIcon from '@mui/icons-material/ReplyAllRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { FincashService, IFincash, IGetSales, SaleService } from "../../shared/services/api";

const NUMBER_OF_SKELETONS = Array(7).fill(null);

export const ShowSales: React.FC = () => {
	const { id } = useParams();
	const theme = useTheme();
	const smDown = useMediaQuery(theme.breakpoints.down('sm'));
	const navigate = useNavigate();


	const [searchParams, setSearchParams] = useSearchParams();
	const [rows, setRows] = useState<IGetSales[]>([]);
	const [totalCount, setTotalCount] = useState(0);
	const [loading, setLoading] = useState(true);
	const [fincash, setFincash] = useState<IFincash>();

	const page = useMemo(() => {
		return searchParams.get('page') || 1;
	}, [searchParams]);

	const backPage = useMemo(() => {
		return searchParams.get('backPage') || 1;
	}, [searchParams]);


	const listSales = async (fincashId: number) => {
		try {
			const result = await SaleService.getSalesByFincash(fincashId, Number(page));
			if (result instanceof Error) {
				alert(result.message);
			} else {
				console.log(result);

				setTotalCount(result.totalCount);
				setRows(result.data);
			}
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		if (id) {
			fetchDataId(Number(id));
		} else {
			fetchData();
		}
	}, [page]);

	const fetchDataId = async (id: number) => {
		setLoading(true);
		listSales(id);

	}

	const fetchData = async () => {
		setLoading(true);
		if (!fincash) {
			const fincashData = await FincashService.getOpenFincash();
			if (fincashData instanceof Error) {
				Swal.fire({
					icon: "error",
					title: "Erro",
					text: "Nenhum caixa aberto encontrado!",
					showConfirmButton: true,
				});
				navigate('/caixa/novo');
			} else {
				setFincash(fincashData);
				listSales(fincashData.id);
			}
		} else {
			listSales(fincash.id);
		}

	}

	const handleCancelSale = (id: number) => {
		let timerInterval: number; // Usa 'number' para o intervalo no navegador

		Swal.fire({
			title: 'Cancelar Venda?',
			text: `CUIDADO! Não será possível reverter esta ação!`,
			icon: 'warning',
			iconColor: theme.palette.error.main,
			showCancelButton: true,
			confirmButtonColor: theme.palette.error.main,
			cancelButtonColor: '#aaa',
			cancelButtonText: 'Cancelar',
			confirmButtonText: 'Prosseguir',
			didOpen: () => {
				const confirmButton = Swal.getConfirmButton();
				if (confirmButton) {
					confirmButton.disabled = true; // Desabilita o botão inicialmente

					let timeLeft = 7;
					confirmButton.textContent = `Prosseguir (${timeLeft})`;

					// Timer de 5 segundos
					timerInterval = window.setInterval(() => {
						timeLeft--;
						confirmButton.textContent = `Prosseguir (${timeLeft})`;

						if (timeLeft === 0) {
							clearInterval(timerInterval);
							confirmButton.textContent = 'Prosseguir';
							confirmButton.disabled = false; // Habilita o botão após o timer
						}
					}, 1000);
				}
			},
			willClose: () => {
				clearInterval(timerInterval); // Limpa o intervalo quando o modal fechar
			}
		}).then((result) => {
			if (result.isConfirmed) {
				SaleService.cancelSale(id).then((result) => {
					if (result instanceof Error) {
						alert(result.message);
					} else {
						Swal.fire({
							title: 'Sucesso!',
							text: 'Venda cancelada.',
							icon: 'success',
						});
						if (fincash) listSales(fincash.id);
					}
				});
			}
		});
	};


	return (
		<>
			<LayoutMain title="Vendas" subTitle={"Gerencie as vendas do caixa"}>
				{
					id &&
					<Paper sx={{ backgroundColor: '#fff', mr: 4, px: 3, py: 1 }}>
						<Box display={'flex'} justifyContent={'space-between'}>
							<Link to={`/caixa/${id}?backPage=${backPage}`}>
								<Button variant="contained"> <ReplyAllRoundedIcon sx={{ mr: 1 }} /> Voltar </Button>
							</Link>
						</Box>
					</Paper>
				}
				<Paper variant="elevation" sx={{ backgroundColor: '#fff', mr: 4, px: 3, py: 1, mt: 1, width: 'auto' }}>
					<Box minHeight={625}>
						<TableContainer>
							<Table sx={{ minWidth: smDown ? 200 : 650 }} aria-label="simple table">
								<TableHead>
									<TableRow>
										{!smDown && <TableCell>Venda</TableCell>}
										<TableCell>Horário</TableCell>
										<TableCell>Valor</TableCell>
										<TableCell>Ações</TableCell>
										{!smDown && <TableCell>Observações</TableCell>}
										{!id && !smDown && <TableCell sx={{ width: 80 }}>Cancelamento</TableCell>}
									</TableRow>
								</TableHead>

								<TableBody>
									{!loading ?
										rows?.map(
											(row) => (
												<TableRow
													key={row.sale_id}
													sx={
														row.deleted_at ?
															{ backgroundColor: '#ff222222', '&:hover': { backgroundColor: '#ff22223a' } }
															:
															{ '&:hover': { backgroundColor: '#1111' } }
													}
												>
													{!smDown && <TableCell>{row.sale_id}</TableCell>}
													<TableCell>{format(row.created_at, 'HH:mm:ss')}</TableCell>
													<TableCell>{nToBRL(row.total_value)}</TableCell>
													<TableCell>
														<Link to={id ? `/vendas/${row.sale_id}?back=${id}` : '/vendas/' + row.sale_id}>
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
													{!smDown &&
														<TableCell sx={{ maxWidth: 120 }}>
															<Typography noWrap overflow="hidden" textOverflow="ellipsis" marginRight={6}>
																{row.obs}
															</Typography>
														</TableCell>
													}
													{
														!id && !smDown &&
														<TableCell>
															{
																!row.deleted_at &&
																<Fab
																	size="medium"
																	color="error"
																	onClick={() => handleCancelSale(row.sale_id)}
																>
																	<BlockIcon />
																</Fab>
															}
														</TableCell>
													}
												</TableRow>
											)
										)
										:
										NUMBER_OF_SKELETONS.map((_, index) => (
											<TableRow key={index}>
												<TableCell >
													<Skeleton sx={{ minHeight: 40, maxWidth: 50 }} />
												</TableCell>
												<TableCell >
													<Skeleton sx={{ minHeight: 40, maxWidth: 80 }} />
												</TableCell>
												<TableCell >
													<Skeleton sx={{ minHeight: 40, maxWidth: 80 }} />
												</TableCell>
												<TableCell >
													<Fab disabled size='medium'></Fab>
												</TableCell>
												<TableCell >
													<Skeleton sx={{ minHeight: 40, maxWidth: 230 }} />
												</TableCell>
											</TableRow>
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
						<TableRow>
							<TableCell colSpan={3}>
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
							</TableCell>
						</TableRow>
					)}
				</Paper>
			</LayoutMain >
		</>
	);
};