// generic table component reusable for all admin pages
import { Table, Thead, Tbody, Tr, Th, Td, TableContainer } from "@chakra-ui/react"



// definition of a column : a header and a render function
interface Column<T> {
    header: string
    render: (item: T) => React.ReactNode
}

interface AdminTableProps<T> {
    columns: Column<T>[]
    data: T[]
    // called when clicking on a header (for sorting)
    onHeaderClick?: (header: string) => void
    // called when clicking on a row
    onRowClick?: (item: T) => void
}

function AdminTable<T>({ columns, data, onRowClick, onHeaderClick }: 
    AdminTableProps<T>) {
    return (
        <TableContainer
            bg="rgba(0,0,0,0.3)"
            borderRadius="lg"
            border="2px solid"
            borderColor="zombieland.primary"
            boxShadow="inset 0 2px 6px rgba(0,0,0,0.4)"
            overflowX="auto"
        >
            <Table variant="unstyled">
                <Thead>
                    <Tr borderBottom="1px solid" borderColor="rgba(71,97,130,0.6)">
                        {columns.map((col) => (
                            <Th
                                key={col.header}
                                color="rgba(250,235,220,0.55)"
                                fontFamily="body"
                                fontWeight="700"
                                fontSize="12px"
                                letterSpacing="1px"
                                textTransform="uppercase"
                                py={4}
                                px={5}
                                cursor={onHeaderClick ? "pointer" : "default"}
                                transition="color 0.2s ease"
                                _hover={onHeaderClick ? {
                                    color: "zombieland.white",
                                } : undefined}
                                onClick={() => onHeaderClick?.(col.header)}
                            >
                                {col.header}
                            </Th>
                        ))}
                    </Tr>
                </Thead>
                <Tbody>
                    {data.map((item, index) => (
                        <Tr
                            key={index}
                            borderBottom="1px solid"
                            borderColor="rgba(255,255,255,0.04)"
                            transition="background 0.2s ease"
                            cursor={onRowClick ? "pointer" : "default"}
                            bg={index % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)"}
                            _hover={onRowClick ? {
                                bg: "rgba(71,97,130,0.18)",
                            } : undefined}
                            onClick={() => onRowClick?.(item)}
                        >
                            {columns.map((col) => (
                                <Td
                                    key={col.header}
                                    color="zombieland.white"
                                    fontFamily="body"
                                    fontWeight="300"
                                    fontSize="14px"
                                    py={4}
                                    px={5}
                                >
                                    {col.render(item)}
                                </Td>
                            ))}
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </TableContainer>
    )
}

export default AdminTable