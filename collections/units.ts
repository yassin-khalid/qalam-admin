import { queryClient } from "@/lib/utils";
import { createCollection } from "@tanstack/db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";

// const Unit
// const unitCollection = createCollection(queryCollectionOptions({
//     queryKey: ['units'],
//     queryFn: async () => {
//         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/units`)
//         const data = await response.json()
//         return data
//     },
//     queryClient,
//     getKey: (item) => item.id,
// }))