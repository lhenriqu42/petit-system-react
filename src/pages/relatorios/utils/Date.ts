import { format } from "date-fns";

const daysOfWeek = {
	'Sun': 'Dom',
	'Mon': 'Seg',
	'Tue': 'Ter',
	'Wed': 'Qua',
	'Thu': 'Qui',
	'Fri': 'Sex',
	'Sat': 'Sab',
};

export const formatDateWithCustomDay = (date: Date, formatString: string) => {
	// Obter o nome do dia da semana em inglês
	const dayOfWeek = format(date, 'EEE') as keyof typeof daysOfWeek;
	// Mapear o nome do dia da semana para o formato desejado
	const abbreviatedDay = daysOfWeek[dayOfWeek] || '';
	// Formatando a data final
	const formattedDate = format(date, formatString);
	return `${formattedDate} - ${abbreviatedDay}`;
};