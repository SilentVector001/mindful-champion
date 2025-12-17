import { redirect } from 'next/navigation'

export default function LibraryRedirect() {
  // Redirect /library to /train/library
  redirect('/train/library')
}
