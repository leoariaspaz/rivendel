export interface FindParteReclamoDTO {
  rol: string;
  parte: {
    id: number;
    nombre: string;
    cuil: string;
  };
}
