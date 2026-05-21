export interface ReclamosListParteReclamoItemDTO {
  rol: string;
  parte: {
    id: number;
    nombre: string;
    cuil: string;
  };
}
