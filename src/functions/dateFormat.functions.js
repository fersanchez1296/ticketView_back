import { format } from "date-fns";
import { es } from "date-fns/locale";

const formateDate = (date) => {
    if (!date || !(date instanceof Date)) {
        return "Fecha no válida"; // Si no es un objeto Date, devuelve un mensaje adecuado
    }
    
    return format(date, "d 'de' MMMM 'de' yyyy, h:mm a", { locale: es });
};

export default formateDate;