import { useEffect, useMemo, useState } from "react";
import { IPaymentResponse, PaymentService } from "../../shared/services/api";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { LayoutMain } from "../../shared/layouts";
import ReplyAllRoundedIcon from '@mui/icons-material/ReplyAllRounded';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { Box, Button, Paper, Skeleton, TextField, Typography, useMediaQuery, useTheme } from "@mui/material";
import { format } from "date-fns";

export const PaymentDetail: React.FC = () => {
	const theme = useTheme();
	const smDown = useMediaQuery(theme.breakpoints.down('sm'));

	const { id } = useParams();
	const [desc, setDesc] = useState('');
	const [payment, setPayment] = useState<IPaymentResponse>();
	const [copied, setCopied] = useState(false);
	const [searchParams] = useSearchParams();

	const backPage = useMemo(() => {
		return searchParams.get('backPage');
	}, [searchParams]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const paymentFetch = await PaymentService.getById(Number(id));
				if (paymentFetch instanceof Error) return 'outflow not found';
				setPayment(paymentFetch);

				paymentFetch.desc && setDesc(paymentFetch.desc);

			} catch (e) {

				console.log(e);
			}
		}

		fetchData();
	}, []);

	// const handleSubmit = () => {
	// 	setLoading(true);
	// 	const result = await OutflowService.updateDescById(Number(id), { desc: desc.trim() });

	// 	if (result instanceof Error) {
	// 		return Swal.fire({
	// 			icon: "error",
	// 			title: "Atenção",
	// 			text: "Descrição não pode ser vazia",
	// 			showConfirmButton: true,
	// 		});
	// 	}

	// 	Swal.fire({
	// 		icon: "success",
	// 		title: "Sucesso!",
	// 		text: "Descrição alterada com sucesso!",
	// 		showConfirmButton: true,
	// 	});
	// 	setLoading(false);
	// 	if (outflow) outflow.desc = desc;
	// }

	return (
		<LayoutMain title={"Boleto " + id} subTitle={"Boleto " + id}>
			<Paper sx={{ backgroundColor: '#fff', mr: 4, px: 3, py: 1 }}>
				<Box display={'flex'} justifyContent={'space-between'}>
					<Link to={`/boletos?page=${backPage}`}>
						<Button variant="contained"> <ReplyAllRoundedIcon sx={{ mr: 1 }} /> Voltar </Button>
					</Link>
				</Box>
			</Paper>
			<Paper sx={{ backgroundColor: '#fff', mr: 4, px: 3, py: 1, mt: 1 }}>
				<Box margin={5}>
					<Typography variant={smDown ? 'h6' : 'h4'} margin={1}>{payment?.expiration ? 'Validade: ' + format(payment.expiration, !smDown ? 'dd / MM / yyyy' : 'dd / MM / yy') : <Skeleton sx={{ maxWidth: 300 }} />}</Typography>
					<Typography variant="h6" margin={1}>{payment?.name ? 'Fornecedor: ' + payment.name : <Skeleton sx={{ maxWidth: 300 }} />}</Typography>
					{payment?.code ?
						<Box display={'flex'} alignItems={smDown ? '' : 'center'} gap={1} flexDirection={smDown ? 'column' : 'row'}>
							<Typography variant="h6" margin={1} overflow="hidden" textOverflow="ellipsis"> Código: {payment.code}</Typography>
							<Button
								onClick={() => { navigator.clipboard.writeText(payment.code); setCopied(true); }}
								variant="outlined"
								onMouseLeave={() => setCopied(false)}
							>
								{
									copied ?
										<CheckIcon />
										:
										<ContentCopyIcon />
								}
							</Button>
						</Box>
						:
						<Skeleton sx={{ maxWidth: 300 }} />
					}
					<Typography variant="h6" margin={1}>{payment?.value ? 'Valor: ' + payment.value : <Skeleton sx={{ maxWidth: 300 }} />}</Typography>
				</Box>
				<Box display={'flex'} flexDirection={'column'} gap={2} margin={2}>
					<TextField
						rows={4}
						fullWidth
						multiline
						sx={{ my: 2 }}
						value={desc}
						onChange={(e) => setDesc(e.target.value)}
						label="Descrição"
						id="elevation-multiline-static"
						autoComplete="off"
					/>
					{/* <Button variant="contained" color="primary" size="large" onClick={handleSubmit} sx={{ maxWidth: 250 }} disabled={loading || payment?.desc == desc}>
						Alterar Descrição
					</Button> */}
				</Box>
			</Paper>
		</LayoutMain>
	);
};