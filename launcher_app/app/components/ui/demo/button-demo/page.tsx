"use client";

import React from "react";
import Button from "../../Button";

export default function Page() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Demo Button</h1>

      <div className="flex gap-3">
        <Button>Primary (default)</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="danger">Danger</Button>
      </div>

      <div className="flex gap-3">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>

      <div className="flex gap-3 items-center">
        <Button as="a" href="/#">Como enlace</Button>
        <Button disabled>Disabled</Button>
      </div>
    </div>
  );
}