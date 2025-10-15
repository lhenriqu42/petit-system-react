import {
    Box,
    Fab,
    Icon,
    Table,
    Alert,
    Paper,
    Button,
    Skeleton,
    TableRow,
    useTheme,
    TextField,
    TableBody,
    TableHead,
    TableCell,
    Pagination,
    useMediaQuery,
} from '@mui/material';
import * as yup from 'yup';
import Swal from 'sweetalert2'
import './../../shared/css/sweetAlert.css'
import { FormHandles } from '@unform/core';
import AddIcon from '@mui/icons-material/Add';
import { VForm } from '../../shared/forms/VForm';
import { useDebounce } from '../../shared/hooks';
import CheckIcon from '@mui/icons-material/Check';
import { LayoutMain } from '../../shared/layouts';
import { Environment } from '../../shared/environment';
import { Link, useSearchParams } from 'react-router-dom';
import { VTextField } from '../../shared/forms/VTextField';
import { useEffect, useMemo, useRef, useState } from 'react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { VSelect, IMenuItens } from '../../shared/forms/VSelect';
import { IProduct, ProductService } from '../../shared/services/api';
import { nToBRL } from '../../shared/services/formatters';

const NUMBER_OF_SKELETONS = Array(7).fill(null);


const selectManuItens: IMenuItens[] = [
    { text: '1 - Bebidas', value: '1' },
    { text: '2 - Chocolates', value: '2' },
    { text: '3 - Salgadinhos', value: '3' },
    { text: '4 - Sorvetes', value: '4' }
];

interface IFormDataValidated {
    id: number;
    name: string;
    sector: number;
    price: number;
}

interface IFormData {
    id: string;
    name: string;
    sector: number;
    price: string;
}


const formValidation: yup.Schema<IFormDataValidated> = yup.object().shape({
    id: yup.number().required().integer(),
    name: yup.string().required().min(3).max(50),
    sector: yup.number().required().min(1).max(4),
    price: yup.number().required().min(0),
});


export const Products: React.FC = () => {
    const theme = useTheme();
    const smDown = useMediaQuery(theme.breakpoints.down('sm'));

    const { debounce } = useDebounce();
    const [searchParams, setSearchParams] = useSearchParams();

    const [copied, setCopied] = useState('');

    const [isEdit, setIsEdit] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [rows, setRows] = useState<IProduct[]>([]);
    const [querryError, setQuerryError] = useState(false);

    // Loading
    const [loading, setLoading] = useState(true);
    const [editLoading, setEditLoading] = useState(false);
    const [loadingPage, setLoadingPage] = useState(true);

    const formRef = useRef<FormHandles>(null);


    const search = useMemo(() => {
        return searchParams.get('search') || ''
    }, [searchParams])

    const page = useMemo(() => {
        return searchParams.get('page') || 1;
    }, [searchParams]);

    useEffect(() => {
        setLoadingPage(true);
        setLoading(true);
        debounce(() => {
            listProducts();
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, page]);


    const listProducts = async () => {
        try {

            const result = await ProductService.getAll(Number(page), 7, search);

            if (result instanceof Error) {
                alert(result.message);
            } else {
                setRows(result.data);
                setTotalCount(result.totalCount);
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

    const handleDelete = (id: number, name: string) => {
        Swal.fire({
            title: 'Tem Certeza?',
            text: `Apagar "${name}" ?`,
            icon: 'warning',
            iconColor: theme.palette.error.main,
            showCancelButton: true,
            confirmButtonColor: theme.palette.error.main,
            cancelButtonColor: '#aaa',
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'Deletar'
        }).then((result) => {
            if (result.isConfirmed) {
                ProductService.deleteById(id).then((result) => {
                    if (result instanceof Error) {
                        alert(result.message);
                    } else {
                        Swal.fire({
                            title: 'Deletado!',
                            text: 'Produto apagado.',
                            icon: 'success',
                        });
                        listProducts();
                    }
                });

            }
        });
    };

    const handleEditMode = (id: number) => {
        setIsEdit(id)
    }

    const handleSubmit = async (data: IFormData) => {
        setEditLoading(true);
        try {
            const getNumbers = data.price.replace(/[^\d,.-]/g, '');
            data.price = getNumbers.replace('.', '').replace(',', '.');
            const dataValidated = await formValidation.validate(data, { abortEarly: false })
            const result = await ProductService.updateById(Number(data.id), dataValidated);

            if (result instanceof Error) {
                setQuerryError(true);
            } else {
                setQuerryError(false);
                setIsEdit(0);
                listProducts();
                Swal.fire({
                    icon: "success",
                    title: "Produto editado com sucesso!",
                    showConfirmButton: false,
                    timer: 1500
                });
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
            setQuerryError(true);
        } finally {
            setEditLoading(false);
        }
    }

    return (
        <LayoutMain title="Produtos" subTitle='Cadastre, edite e remova produtos'>
            <Paper sx={{ backgroundColor: '#fff', mr: 4, px: 3, py: 1 }} variant="elevation">
                <Box display={'flex'} justifyContent={'space-between'}>
                    <TextField
                        size="small"
                        placeholder={'Pesquisar'}
                        value={search}
                        onChange={(event) => { setSearchParams({ search: event.target.value }, { replace: true }) }}
                        autoComplete="off"
                    />
                    <Link to={'/produtos/novo'}>
                        {(!smDown && <Button variant="contained"><AddIcon sx={{ mr: 1 }} />Novo Produto</Button>)}
                        {(smDown && <Button variant="contained" sx={{ ml: 2 }}><AddIcon /></Button>)}
                    </Link>
                </Box>
            </Paper>
            <Paper variant="elevation" sx={{ backgroundColor: '#fff', mr: 4, px: 3, py: 1, mt: 1, width: 'auto', minHeight: 600 }}>
                {(querryError && <Alert severity="error">Já existe um produto com este código !</Alert>)}
                <VForm
                    onSubmit={handleSubmit}
                    placeholder={''}
                    ref={formRef}
                >
                    <Box minHeight={640}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {(!smDown && <TableCell width={160}>Código</TableCell>)}
                                    <TableCell width={406}>Nome</TableCell>
                                    {(!smDown && <TableCell width={305}>Setor</TableCell>)}
                                    <TableCell width={340}>Preço</TableCell>
                                    <TableCell width={232}>Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>

                                {!loading ? rows.map(
                                    row => (
                                        isEdit !== row.id ?
                                            <TableRow key={row.id} hover>

                                                {(!smDown &&
                                                    <TableCell
                                                        onMouseDown={() => { navigator.clipboard.writeText(row.code); setCopied(row.code); }}
                                                        onMouseLeave={() => setCopied('')}
                                                        sx={copied != row.code ? {
                                                            cursor: 'pointer'
                                                        } : {
                                                            cursor: 'default'
                                                        }}
                                                    >
                                                        <Box
                                                            display={'flex'}
                                                            alignItems={'center'}
                                                            gap={2}
                                                        >
                                                            {row.code}
                                                            <Box>
                                                                {
                                                                    copied == row.code ?
                                                                        <CheckIcon fontSize='small' />
                                                                        :
                                                                        <ContentCopyIcon fontSize='small' />
                                                                }
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                )}
                                                <TableCell>{row.name}</TableCell>
                                                {(!smDown && (
                                                    <TableCell>{
                                                        row.sector === 1 ? '1 - Bebidas' :
                                                            row.sector === 2 ? '2 - Chocolates' :
                                                                row.sector === 3 ? '3 - Salgadinhos' :
                                                                    row.sector === 4 ? '4 - Sorvetes' :
                                                                        `${row.sector} - Desconhecido`
                                                    }
                                                    </TableCell>
                                                ))}
                                                <TableCell>{nToBRL(row.price)}</TableCell>
                                                <TableCell>
                                                    {(!isEdit &&
                                                        <Fab size="medium" color="error" aria-label="add" sx={{ mr: 2, ...(smDown && { mb: 1 }) }} onClick={() => handleDelete(row.id, row.name)}>
                                                            <Icon>delete</Icon>
                                                        </Fab>
                                                    )}
                                                    {(smDown &&
                                                        <Link to={'/produtos/edit/' + row.id}>
                                                            <Fab size="medium" color="warning" aria-label="add">
                                                                <Icon>edit</Icon>
                                                            </Fab>
                                                        </Link>
                                                    )}
                                                    {(!smDown &&
                                                        <Fab size="medium" color="warning" aria-label="add" onClick={() => handleEditMode(row.id)}>
                                                            <Icon>edit</Icon>
                                                        </Fab>
                                                    )}

                                                </TableCell>
                                            </TableRow >
                                            :
                                            <TableRow key={row.id} hover>
                                                <TableCell>
                                                    {row.code}
                                                </TableCell>
                                                <TableCell>
                                                    <Box maxWidth={330}>
                                                        <VTextField name='id' valueDefault={`${row.id}`} sx={{ display: 'none' }} />
                                                        <VTextField name='name' label={'Nome'} autoComplete="off" valueDefault={row.name} />
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <VSelect name='sector' label='Setor' menuItens={selectManuItens} defaultSelected={row.sector} messageError='Setor não pode ser vazio' />
                                                </TableCell>
                                                <TableCell>
                                                    <Box width={180}>
                                                        <VTextField
                                                            name='price'
                                                            label={'Preço'}
                                                            autoComplete="off"
                                                            valueDefault={nToBRL(row.price)}
                                                            cash
                                                        />
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Fab size="medium" color="error" aria-label="add" sx={{ mr: 2 }} onClick={() => setIsEdit(0)}>
                                                        <Icon>close</Icon>
                                                    </Fab>
                                                    <Fab size="medium" color="success" aria-label="add" onClick={() => formRef.current?.submitForm()} disabled={editLoading}>
                                                        <Icon>check</Icon>
                                                    </Fab>
                                                </TableCell>
                                            </TableRow >
                                    )
                                )
                                    :

                                    NUMBER_OF_SKELETONS.map((_, index) => (
                                        <TableRow key={index}>
                                            <TableCell >
                                                <Skeleton sx={{ minHeight: 40, maxWidth: 100 }} />
                                            </TableCell>
                                            <TableCell >
                                                <Skeleton sx={{ minHeight: 40, maxWidth: 200 }} />
                                            </TableCell>
                                            <TableCell >
                                                <Skeleton sx={{ minHeight: 40, maxWidth: 80 }} />
                                            </TableCell>
                                            <TableCell >
                                                <Skeleton sx={{ minHeight: 40, maxWidth: 60 }} />
                                            </TableCell>
                                            <TableCell >
                                                <Fab disabled size='medium' sx={{ mr: 2 }}></Fab>
                                                <Fab disabled size='medium'></Fab>
                                            </TableCell>
                                        </TableRow>
                                    ))

                                }
                            </TableBody>

                            {totalCount === 0 && !loading && (
                                <caption>{Environment.LISTAGEM_VAZIA}</caption>
                            )}

                        </Table>
                    </Box>
                    {(totalCount > 0 && totalCount > Environment.LIMITE_DE_LINHAS) && (
                        <Pagination
                            sx={{ m: 1 }}
                            disabled={loadingPage}
                            page={Number(page)}
                            count={Math.ceil(totalCount / Environment.LIMITE_DE_LINHAS)}
                            onChange={(_, newPage) => { setSearchParams({ search, page: newPage.toString() }, { replace: true }); }}
                            siblingCount={smDown ? 0 : 1}
                        />
                    )}
                </VForm>
            </Paper>
        </LayoutMain >
    );
};