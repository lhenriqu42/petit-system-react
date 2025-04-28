import {
	Box,
	Grid,
	Table,
	Paper,
	Alert,
	Button,
	useTheme,
	Skeleton,
	TextField,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	Typography,
	useMediaQuery,
	TableContainer,
	Dialog,
	DialogTitle,
	DialogContent,
} from "@mui/material";
import Swal from 'sweetalert2'
import { useNavigate } from "react-router-dom";
import { LayoutMain } from "../../shared/layouts";
import { useEffect, useRef, useState } from "react";
import SettingsIcon from '@mui/icons-material/Settings';
import CalculateIcon from '@mui/icons-material/Calculate';
import { BRLToN, nToBRL } from "../../shared/services/formatters";
import FastRewindIcon from '@mui/icons-material/FastRewind';
import { IProduct, ProductService } from './../../shared/services/api/';
import ArrowLeftRoundedIcon from '@mui/icons-material/ArrowLeftRounded';
import ArrowRightRoundedIcon from '@mui/icons-material/ArrowRightRounded';
import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded';
import { FincashService, IFincash, SaleService, GroupService, IGroup, ISaleObs } from "../../shared/services/api";
import { CustomTextField } from "../../shared/forms/customInputs/CustomTextField";

const NUMBER_OF_SKELETONS_GROUP = Array(18).fill(null);
const NUMBER_OF_SKELETONS_PROD = Array(7).fill(null);


export const Sale: React.FC = () => {
	const theme = useTheme()
	const navigate = useNavigate();
	const smDown = useMediaQuery(theme.breakpoints.down('sm'));

	const [obs, setObs] = useState('');
	const [code, setCode] = useState('');
	const [totalPrice, setTotalPrice] = useState(0);
	const [notFound, setNotFound] = useState(false);
	const [lastResult, setLastResult] = useState<IProduct | undefined>();
	const [products, setProducts] = useState<IProduct[]>([]);
	const [submitLoading, setSubmitLoading] = useState(false);
	const [openFincash, setOpenFincash] = useState<Error | IFincash>(Error('default'));


	const [obsFocus, setObsFocus] = useState(false);
	const [groups, setGroups] = useState<IGroup[]>();

	const codeInputRef = useRef<HTMLInputElement>();
	const obsInputRef = useRef<HTMLInputElement>();

	useEffect(() => {

		const fetchData = async () => {
			const result = await FincashService.getOpenFincash();
			setOpenFincash(result);
			listGroups();
		}
		if (!smDown) {
			fetchData();
		} else {
			alert('Essa tela não funciona em smartphones')
			navigate('/produtos');
		}
		// codeInputRef.current?.addEventListener('blur', () => {
		// 	if (!obsFocus) inputFocus();
		// })
	}, []);


	const inputFocus = () => {
		codeInputRef.current?.focus();
	}

	const listGroups = async () => {
		try {
			setLoading(true);
			const response = await GroupService.getShowGroups();
			if (response instanceof Error) return;
			setGroups(response);
		} catch (e) {
			alert(e)
		} finally {
			setLoading(false);
		}
	}


	if (openFincash instanceof Error) {
		navigate('/caixa/novo');
	}

	useEffect(() => {
		const totalCalc = products.map((prod) => {
			const calc = (prod.quantity || 0) * prod.price;
			const calc100 = calc * 100;
			return calc100;
		})


		setTotalPrice(totalCalc.reduce((total, currentItem) => total + currentItem, 0) / 100);
		inputFocus()
	}, [products]);


	const handleQuantityChange = (productCode: string, changeAmount: number) => {
		setProducts((prevProducts) => {
			const updatedProducts = prevProducts.map((product) => {
				if (product.code === productCode) {
					const newQuantity = (product.quantity || 0) + changeAmount;

					return newQuantity > 0 ? { ...product, quantity: newQuantity } : null;
				}

				return product;
			});

			const filteredProducts = updatedProducts.filter(Boolean) as IProduct[];

			return filteredProducts;
		});
	};


	useEffect(() => {
		if (lastResult) {
			const index = products.findIndex((p) => p.code === lastResult.code);
			if (index === -1) {
				setLastResult(products[products.length - 1]);
			}
		}
	}, [products]);

	const handleEnter = async (e: React.KeyboardEvent<HTMLDivElement>) => {
		setNotFound(false);
		if (e.code === 'Enter' || e.key === 'Enter') {
			if (!code.trim() && !lastResult) return;
			if (!code.trim() && lastResult) {
				handleProducts('', lastResult);
			} else {
				handleProducts(code.trim());
			}
		}

		if (e.code === 'Space' || e.key === 'Space') {
			if ((products && products.length === 0) || submitLoading) {
				return setCode('');
			} else {
				handleSubmit();
			}
		}

		if (e.code === 'ArrowLeft' || e.key === 'ArrowLeft') {
			if (!code.trim() && !lastResult) return;
			if (!code.trim() && lastResult) {
				handleQuantityChange(lastResult.code, -1);
			}
		}

		if (e.code === 'ArrowRight' || e.key === 'ArrowRight') {
			if (!code.trim() && !lastResult) return;
			if (!code.trim() && lastResult) {
				handleQuantityChange(lastResult.code, 1)
			}
		}

		if (e.code === 'ArrowUp' || e.key === 'ArrowUp') {
			if (!code.trim() && !lastResult) return;
			if (!code.trim() && lastResult) {
				const index = products.findIndex((p) => p.code === lastResult.code);
				if (index !== -1) {
					if (products[index - 1]) {
						setLastResult(products[index - 1]);
					}
				}
			}
		}

		if (e.code === 'ArrowDown' || e.key === 'ArrowDown') {
			if (!code.trim() && !lastResult) return;
			if (!code.trim() && lastResult) {
				const index = products.findIndex((p) => p.code === lastResult.code);
				if (index !== -1) {
					if (products[index + 1]) {
						setLastResult(products[index + 1]);
					}
				}
			}
		}
	};

	const handleProducts = async (prodCode: string, product?: IProduct) => {
		try {
			setSubmitLoading(true);
			setNotFound(false);
			let response: IProduct | Error;
			if (product) {
				response = product;
			} else {
				response = await ProductService.getByCode(prodCode);
			}
			const result = response;
			if (result instanceof Error) {
				setNotFound(true);
			} else {
				setLastResult(result);
				// Check if the product is already in the products array
				const existingProductIndex = products.findIndex((p) => p.code === result.code);

				if (existingProductIndex !== -1) {
					// If the product exists, update its quantity
					const updatedProducts = [...products];
					updatedProducts[existingProductIndex] = {
						...result,
						quantity: (updatedProducts[existingProductIndex].quantity || 0) + 1,
					};
					setProducts(updatedProducts);
				} else {
					// If the product doesn't exist, add it to the products array
					setProducts((prevProducts) => [...prevProducts, { ...result, quantity: 1 }]);
				}
			}

			setCode('');
		} catch (e) {
			console.error(e)
		} finally {
			setSubmitLoading(false);
		}
	}

	const handleSubmit = async () => {
		try {
			setSubmitLoading(true);
			const data = products.map((prod) => {
				return {
					prod_id: prod.id,
					price: prod.price,
					quantity: prod.quantity
				}
			});

			const dataObs = {
				data: data,
				obs: obs,
			}

			const result = await SaleService.create(dataObs as ISaleObs);
			if (result instanceof Error) return alert('Venda não efetuada.');
			setProducts([]);
			setObs('');
			setLastResult(undefined);
			Swal.fire({
				icon: "success",
				title: "Venda efetuada com sucesso!",
				showConfirmButton: false,
				timer: 1000,
			});
		} catch (error) {
			return alert(error);
		} finally {
			setSubmitLoading(false);
			setCode('')
		}
	}
	useEffect(() => {
		if (obsFocus) {
			obsInputRef.current?.focus();
		}
	}, [obsFocus])
	useEffect(() => {
		inputFocus();
	}, [notFound])
	// GROUP HANDLES
	const [selectedGroup, setSelectedGroup] = useState(0);
	const [prodGroup, setProdGroup] = useState<IProduct[]>();
	const [prodTotalCount, setProdTotalCount] = useState(0);
	const [loading, setLoading] = useState(true);
	const handleClickGroup = (group_id: number) => {
		setSelectedGroup(group_id);
		listProductsInGroup(group_id);
	}

	const listProductsInGroup = async (group_id: number) => {
		try {
			setLoading(true);
			const response = await GroupService.getProdsByGroup(group_id, 1, '', 999999999);
			if (response instanceof Error) return;
			setProdGroup(response.data);
			setProdTotalCount(response.totalCount);
			setLoading(false);
		} catch (e) {
			alert(e);
		}
	}

	const handleBack = () => {
		setSelectedGroup(0);
		setProdGroup(undefined);
	}

	// CALC MODAL
	const [open, setOpen] = useState(false);
	const [modal, setModal] = useState(false);
	const [calcValue, setCalcValue] = useState(0);
	const [calcResult, setCalcResult] = useState(0);

	const changeInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const calc = calcValue - totalPrice;
		console.log(totalPrice, calcValue, calc);
		setCalcResult(calc);
	}, [totalPrice, calcValue]);

	const handleOpen = () => {
		setOpen(true);
		setModal(true);
	}

	const handleClose = () => {
		setOpen(false);
		setCalcValue(0);
	}

	return (
		<LayoutMain title="Vender" subTitle="">
			<Grid container spacing={2}>
				<Grid item xs={6}>
					<Paper variant="elevation" sx={{ backgroundColor: '#fff', mr: 4, px: 3, py: 1, mt: 1, width: 'auto' }}>
						<Box display={'flex'} gap={1} justifyContent={'space-between'} p={'3px'}>
							<TextField
								fullWidth
								size="small"
								placeholder={'Código'}
								inputRef={codeInputRef}
								onKeyDown={handleEnter}
								value={code} onChange={(e) => setCode(e.target.value)}
								autoComplete="off"
								disabled={submitLoading}
								onBlur={() => {
									if (!obsFocus && !modal) {
										inputFocus()
									}
								}}
							/>
							<Button disabled={modal} variant="contained" onClick={handleOpen}><CalculateIcon sx={{ mr: 1 }} />Troco</Button>
						</Box>
					</Paper>
					<Paper variant="elevation" sx={{ backgroundColor: '#fff', mr: 4, px: 3, py: 1, mt: 1, width: 'auto' }}>
						{(notFound && <Alert severity="error">Nenhum produto encontrado com este código !</Alert>)}
						<Box display={'flex'} minHeight={410}>
							<TableContainer>
								<Table sx={{ minWidth: 650 }} aria-label="simple table">
									<TableHead>
										<TableRow>
											<TableCell width={100}>Código</TableCell>
											<TableCell>Nome</TableCell>
											<TableCell>Preço</TableCell>
											<TableCell>Quantidade</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{products.map((row) => (
											<TableRow
												key={row.code}
												hover
												sx={row.code == lastResult?.code ? { border: 2, borderColor: '#512da8' } : {}}
												onClick={() => setLastResult(row)}
											>
												<TableCell>
													<Typography fontSize={15}>
														{row.code}
													</Typography>
												</TableCell>
												<TableCell>
													<Typography fontSize={15}>
														{row.name}
													</Typography>
												</TableCell>
												<TableCell>
													<Typography fontSize={12}>
														{row.price}
													</Typography>
													<Typography fontSize={15}>
														{(row.price * (row.quantity ?? 1)).toFixed(2)}
													</Typography>
												</TableCell>
												<TableCell>
													<Box display={'flex'} gap={1}>
														<ArrowLeftRoundedIcon
															sx={{ cursor: 'pointer' }}
															fontSize="large"
															onClick={() => handleQuantityChange(row.code, -1)}
														/>
														<Box marginTop={1}>
															{row.quantity}
														</Box>
														<ArrowRightRoundedIcon
															sx={{ cursor: 'pointer' }}
															fontSize="large"
															onClick={() => handleQuantityChange(row.code, 1)}
														/>
													</Box>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</TableContainer>
						</Box>
						<TextField
							rows={3}
							fullWidth
							multiline
							sx={{ mt: 2 }}
							value={obs}
							onChange={(e) => setObs(e.target.value)}
							label="Observações"
							inputRef={obsInputRef}
							autoComplete="off"
							onClick={() => {
								setObsFocus(true);
							}}
							onBlur={() => {
								setObsFocus(false);
								inputFocus();
							}}
						/>
						<Box display={'flex'} gap={38} marginTop={3}>
							<Button
								variant="contained"
								sx={{ mb: 2, ml: 3 }}
								disabled={(products && products.length === 0) || submitLoading}
								onClick={handleSubmit}
							>
								<AddShoppingCartRoundedIcon sx={{ mr: 1 }} /> Finalizar
							</Button>
							<Typography variant="h6">Total: {nToBRL(totalPrice)}</Typography>
						</Box>
					</Paper>
				</Grid>
				<Grid item xs={6}>
					<Paper variant="elevation" sx={{ backgroundColor: '#fff', mr: 4, px: 3, py: 1, mt: 1, width: 'auto' }}>
						<Box display={'flex'} justifyContent={'space-between'} p={'3px'}>
							{selectedGroup ?
								<Button onClick={handleBack} variant="outlined"><FastRewindIcon sx={{ mr: 1 }} />Voltar</Button>
								:
								<Typography variant="h6" ml={1}>Grupos</Typography>
							}
							<Button onClick={() => navigate('/grupos')}><SettingsIcon /></Button>
						</Box>
					</Paper>
					<Paper variant="elevation" sx={{ backgroundColor: '#fff', mr: 4, px: 3, py: 1, mt: 1, width: 'auto' }}>
						<Box border={1} minHeight={570} my={2}>
							{submitLoading ?
								<Grid item container p={2} gap={1}>
								</Grid>
								:
								<Grid item container p={2} gap={1}>
									{selectedGroup ? !loading ?
										<Box width={'100%'} display={'flex'} flexDirection={'column'} gap={1}>
											{prodTotalCount === 0 && !loading && <caption>Nenhum produto encontrado nesse grupo</caption>}
											{prodGroup?.map((prod) =>
												<Box
													key={prod.code}
													gap={15}
													border={1}
													height={40}
													width={'100%'}
													display={'flex'}
													alignItems={'center'}
													sx={{ cursor: 'pointer', ":hover": { backgroundColor: "#eee" } }}
													onClick={() => {
														if (!products.find((pd) => pd.code === prod.code)) {
															handleProducts(prod.code, prod);
														}
													}}
												>
													<Typography variant="body1" ml={1} width={150} noWrap overflow={'hidden'}>{prod.code}</Typography>
													<Typography variant="body1" ml={1} width={300} noWrap overflow={'hidden'}>{prod.name}</Typography>
													{!products.find((pd) => pd.code == prod.code) ?
														<Typography variant="body1" ml={1} width={150} noWrap overflow={'hidden'}>{nToBRL(prod.price)}</Typography>
														:
														<Box display={'flex'} ml={1} width={150}>
															<ArrowLeftRoundedIcon
																sx={{ cursor: 'pointer' }}
																fontSize="large"
																onClick={() => handleQuantityChange(prod.code, -1)}
															/>
															<Box marginTop={1}>
																<Typography>
																	{products.find((pd) => pd.code == prod.code)?.quantity}
																</Typography>
															</Box>
															<ArrowRightRoundedIcon
																sx={{ cursor: 'pointer' }}
																fontSize="large"
																onClick={() => handleQuantityChange(prod.code, 1)}
															/>
														</Box>
													}
												</Box>
											)}
										</Box>
										:
										NUMBER_OF_SKELETONS_PROD.map((_, i) =>
											<Box
												key={i}
												gap={15}
												height={40}
												width={'100%'}
												display={'flex'}
												alignItems={'center'}
											>
												<Skeleton width={'100%'} height={65} sx={{ p: 0, m: 0 }}></Skeleton>
											</Box>
										)
										: !loading ?
											groups?.map((gp) =>
												<Grid
													key={gp.id}
													item
													xs={2.8}
													border={1}
													minHeight={50}
													display={'flex'}
													alignItems={'center'}
													justifyContent={'center'}
													sx={{ cursor: 'pointer', ":hover": { backgroundColor: "#eee" } }}
													onClick={() => handleClickGroup(gp.id)}
												>
													<Typography noWrap overflow={'hidden'}>{gp.name}</Typography>
												</Grid>
											)
											:
											NUMBER_OF_SKELETONS_GROUP.map((_, i) =>
												<Grid
													key={i}
													item
													xs={2.8}
													maxHeight={70}
													display={'flex'}
													alignItems={'center'}
													justifyContent={'center'}
												// border={1}
												// sx={{ cursor: 'pointer', ":hover": { backgroundColor: "#eee" } }}
												>
													<Skeleton width={'100%'} height={85}></Skeleton>
												</Grid>
											)
									}
								</Grid>
							}
						</Box>
					</Paper>
				</Grid >
			</Grid >
			{/* ------------------- ------------------- CALC MODAL ------------------- ------------------- */}
			<Dialog
				open={open}
				onClose={handleClose}
				TransitionProps={{
					onEntered: () => {
						changeInputRef.current?.focus();
					},
					onExited: () => {
						setModal(false);
						inputFocus();
					}
				}}
				sx={{
					"& .MuiDialog-paper":
						{ backgroundColor: "#fff", }
				}}>
				<DialogTitle>Calculadora de Troco</DialogTitle>
				<DialogContent>
					<Box marginY={1} display={'flex'} flexDirection={'column'} gap={1}>
						<CustomTextField
							callBack={(value) => setCalcValue(BRLToN(value))}
							onKeyDown={(e) => { if (e.code === 'Enter' || e.key === 'Enter' || e.key == ' ' || e.code == 'Space') handleClose() }}
							inputRef={changeInputRef}
							label={'Valor'}
							cash
						/>
						<Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
							<Typography variant="h6">Troco: </Typography>
							<Typography variant="h6" color={calcResult < 0 ? 'red' : 'green'} mr={2}>
								{nToBRL(calcResult)}
							</Typography>
						</Box>
					</Box>
				</DialogContent>
			</Dialog>
		</LayoutMain >
	);
};