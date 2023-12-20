"use client"
import Breadcumbs from '@/components/breadcumbs'
import { useParams, useSearchParams } from 'next/navigation'
import React from 'react'

export default function Page() {
  let params = useParams()
  // console.log(params)
  return (
    <div>
      <Breadcumbs/>
      page</div>
  )
}
