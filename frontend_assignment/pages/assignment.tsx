import { useState } from "react";
import Link from "next/link";
import * as Yup from "yup";
import { useForm, yupResolver } from "@mantine/form";
import { NumberInput, TextInput, Button, Box, Group } from "@mantine/core";

const schema = Yup.object().shape({
  name: Yup.string().min(4, "Name should have at least 4 letters"),
  age: Yup.number().min(18, "You must be at least 18 to create an account"),
  address: Yup.string().min(5, "Address should have at least 5 letters"),
});

export default function Assignment() {
  const [response, setResponse] = useState("");
  const form = useForm({
    schema: yupResolver(schema),
    initialValues: {
      name: "",
      age: 18,
      address: "",
    },
  });

  return (
    <div
      style={{
        minWidth: "100vw",
        minHeight: "100vh",
        display: "grid",
        placeContent: "center",
      }}
    >
      <Box sx={{ width: 350 }} mx="auto">
        <Box mb={10}>
          <Link href="/">↵ Go back home</Link>
        </Box>
        <form
          onSubmit={form.onSubmit((values) =>
            setResponse(JSON.stringify(values))
          )}
        >
          <TextInput
            required
            label="Name"
            placeholder="Vitalik Buterin"
            {...form.getInputProps("name")}
          />
          <NumberInput
            required
            label="Age"
            placeholder="28"
            mt="sm"
            {...form.getInputProps("age")}
          />
          <TextInput
            required
            label="Address"
            placeholder="Toronto, Canada"
            mt="sm"
            {...form.getInputProps("address")}
          />

          <Group position="right" mt="xl">
            <Button type="submit">Submit</Button>
          </Group>
        </form>
      </Box>

      <Box mt={20}>
        <pre>{response}</pre>
      </Box>
    </div>
  );
}
