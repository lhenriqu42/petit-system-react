// import {
// 	Box,
// 	Button,
// 	CircularProgress,
// 	Divider,
// 	Typography,
// } from '@mui/material';
// import { endOfMonth, format, startOfMonth } from 'date-fns';
// import { useEffect, useState } from 'react';
// import { LayoutMain } from '../../shared/layouts';
// import { LineChart, PieChart } from '@mui/x-charts';
// import { FincashService, PaymentService, ProductService } from '../../shared/services/api';
// import { nToBRL } from '../../shared/services/formatters';
// import { CustomDatePicker } from '../../shared/forms/customInputs/CustomDatePicker';
// import { DateRange } from '@mui/x-date-pickers-pro';
// import { CustomPaper } from './utils/CustomPaper';
// import { CustomTextField } from '../../shared/forms/customInputs/CustomTextField';
// import { ReportData } from './utils/ReportData';
// import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
// import ArticleIcon from '@mui/icons-material/Article';
// import { CustomSelect } from '../../shared/forms/customInputs/CustomSelect';
// import { CustomButtonGroup } from '../../shared/forms/customInputs/CustomButtonGroup';


// const daysOfWeek = {
// 	'Sun': 'Dom',
// 	'Mon': 'Seg',
// 	'Tue': 'Ter',
// 	'Wed': 'Qua',
// 	'Thu': 'Qui',
// 	'Fri': 'Sex',
// 	'Sat': 'Sab',
// };
// const formatDateWithCustomDay = (date: Date) => {
// 	// Obter o nome do dia da semana em inglês
// 	const dayOfWeek = format(date, 'EEE') as keyof typeof daysOfWeek;
// 	// Mapear o nome do dia da semana para o formato desejado
// 	const abbreviatedDay = daysOfWeek[dayOfWeek] || '';
// 	// Formatando a data final
// 	const formattedDate = format(date, 'dd/MM/yyyy');
// 	return `${formattedDate} - ${abbreviatedDay}`;
// };
// export const ReportPage: React.FC = () => {
// 	const [loading, setLoading] = useState<boolean>(false);
// 	const [mode, setMode] = useState<'TOTAL' | 'PERIOD'>('TOTAL');
// 	return (
// 		<LayoutMain title="Relatórios" subTitle='Geração de relatórios de vendas e finanças'>
// 			<Box>
// 				<CustomPaper borderColor='#1a237e' border>
// 					<Typography variant='h6' p={2}>Filtros</Typography>
// 					{/* <Divider />
// 					<Box p={2} display={'flex'} flexDirection={'column'} gap={2}>
// 						<CustomTextField
// 							sx={{ width: '20%' }}
// 							label='Nome do Relatório'
// 							variant='outlined'
// 						/>
// 						<CustomSelect
// 							defaultSelected={0}
// 							width={'25%'}
// 							label='Filtro de Produtos'
// 							menuItens={[
// 								{ value: 'profit', text: 'Lucro' },
// 								{ value: 'revenue', text: 'Faturamento' },
// 								{ value: 'quantitySold', text: 'Quantidade Vendida' },
// 							]}
// 						/>
// 					</Box> */}
// 					<Divider sx={{ mb: 2 }} />
// 					<CustomButtonGroup
// 						width={500}
// 						buttons={[
// 							{ label: 'Total' },
// 							{ label: 'Periodo' }
// 						]}
// 						onChange={(selected) => { if (!selected) return; setMode(selected.label === 'Total' ? 'TOTAL' : 'PERIOD'); }}
// 					/>
// 					{mode === 'PERIOD' &&
// 						<Box display={'flex'} alignItems={'center'} gap={5} pt={2} px={2}>
// 							<Box display={'flex'} justifyContent={'center'} alignItems={'center'} gap={2} width={'30%'}>
// 								<Typography>De:</Typography>
// 								<CustomTextField type='date' />
// 							</Box>
// 							<Box display={'flex'} justifyContent={'center'} alignItems={'center'} gap={2} width={'30%'}>
// 								<Typography>Até:</Typography>
// 								<CustomTextField type='date' />
// 							</Box>
// 						</Box>
// 					}
// 					<Divider sx={{ my: 2 }} />
// 					<Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
// 						<Button
// 							disabled={loading}
// 							variant='contained'
// 							color='primary'
// 							sx={{ m: 2, width: '30%' }}
// 						>
// 							{loading ? <CircularProgress size={25} /> : 'Gerar Relatório'}
// 						</Button>
// 					</Box>
// 				</CustomPaper>
// 				<CustomPaper borderColor='#1a237e' border mt={2}>
// 					<Box display={'flex'} justifyContent={'space-between'} p={2} gap={5} alignItems={'center'}>
// 						<Box width={'100%'}>
// 							<Typography variant="h6" p={2}>Relatório Gerado</Typography>
// 							<Divider sx={{ mt: 2 }} />
// 						</Box>
// 						<Box border={1} borderColor='grey.400' borderRadius={2} p={1}>
// 							<Typography variant='subtitle1' fontSize={14} mb={1}>Exportar como:</Typography>
// 							<Box display={'flex'} gap={2}>
// 								<Button
// 									startIcon={<PictureAsPdfIcon />}
// 									disabled={loading}
// 									variant='contained'
// 									color='warning'
// 								>
// 									PDF
// 								</Button>
// 								<Button
// 									startIcon={<ArticleIcon />}
// 									disabled={loading}
// 									variant='contained'
// 									color='success'
// 								>
// 									Excel
// 								</Button>
// 							</Box>
// 						</Box>
// 					</Box>
// 					<ReportData
// 						dateRange={{ startDate: startOfMonth(new Date()), endDate: endOfMonth(new Date()) }}
// 					/>
// 				</CustomPaper>
// 			</Box >
// 		</LayoutMain >
// 	);
// };


















